import Navbar from "../Navbar";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { apiClient, postByIdUrl } from "@/api/client";
import { blogPosts as fallbackPosts } from "../../data/blogPost";
import facebookicon from "../../assets/image/Facebook_black.svg"
import twittericon from "../../assets/image/Twitter_black.svg"
import linkedinicon from "../../assets/image/LinkedIN_black2.svg"
import Footer from "../Footer";
import { useCopyToClipboard } from "../../hooks/use-copy-to-clipboard";


function CardDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [comment, setComment] = useState("");
    const [comments, setComments] = useState([]);
    const [likeCount, setLikeCount] = useState(0);
    const [isLiked, setIsLiked] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loadingLike, setLoadingLike] = useState(false);
    const [loadingComment, setLoadingComment] = useState(false);
    const { copyToClipboard, isCopied } = useCopyToClipboard();
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showAccountPrompt, setShowAccountPrompt] = useState(false);

    const handleCopyLink = () => {
        const currentUrl = window.location.href;
        copyToClipboard(currentUrl);
    };

    const handleShareFacebook = () => {
        const url = encodeURIComponent(window.location.href);
        const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        window.open(shareUrl, '_blank', 'width=600,height=400');
    };

    const handleShareTwitter = () => {
        const url = encodeURIComponent(window.location.href);
        const text = encodeURIComponent(post?.title || '');
        const shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
        window.open(shareUrl, '_blank', 'width=600,height=400');
    };

    const handleShareLinkedIn = () => {
        const url = encodeURIComponent(window.location.href);
        const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        window.open(shareUrl, '_blank', 'width=600,height=400');
    };

    // Check login status
    useEffect(() => {
        const token = localStorage.getItem("token");
        setIsLoggedIn(!!token);
    }, []);

    // Fetch post, likes, and comments
    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;

            try {
                setLoading(true);
                
                // Fetch post
                const postResponse = await apiClient.get(`/posts/${id}`);
                if (postResponse.data && (postResponse.data.id || postResponse.data.title)) {
                    const p = postResponse.data;
                    // ใช้เฉพาะวันที่ (ไทย พ.ศ.) เช่น 15/2/2569
                    const formatThaiDate = (dateStr) => {
                        if (!dateStr) return "";
                        const d = new Date(dateStr);
                        return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear() + 543}`;
                    };
                    setPost({
                        id: p.id,
                        title: p.title,
                        image: p.image,
                        description: p.description,
                        content: p.content,
                        category: p.category_name ?? p.category ?? "Uncategorized",
                        date: (p.date || p.created_at) ? formatThaiDate(p.date || p.created_at) : null,
                        author: p.author_name ?? p.author ?? "ผู้เขียน",
                    });
                } else {
                    const localPost = fallbackPosts.find(p => p.id === parseInt(id));
                    setPost(localPost || null);
                }

                // Fetch likes
                try {
                    const likesResponse = await apiClient.get(`/posts/${id}/likes`);
                    setLikeCount(likesResponse.data.count || 0);
                    setIsLiked(likesResponse.data.isLiked || false);
                } catch (err) {
                    // Error fetching likes - silently fail
                }

                // Fetch comments
                try {
                    const commentsResponse = await apiClient.get(`/posts/${id}/comments`);
                    
                    if (!Array.isArray(commentsResponse.data)) {
                        setComments([]);
                        return;
                    }
                    
                    const mappedComments = commentsResponse.data.map((c) => {
                        // รองรับหลาย column names
                        const commentText = c.content || c.comment_text || c.comment || c.text || "";
                        return {
                            id: c.id,
                            text: commentText,
                            author: c.author_name || c.username || "User",
                            date: c.created_at 
                                ? new Date(c.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
                                : new Date().toLocaleDateString(),
                            profilePic: c.profile_pic || null,
                        };
                    });
                    setComments(mappedComments);
                } catch (err) {
                    setComments([]);
                }
            } catch (error) {
                const localPost = fallbackPosts.find(p => p.id === parseInt(id));
                setPost(localPost || null);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    // Scroll to comment section when hash is present
    useEffect(() => {
        if (window.location.hash === "#comments" && !loading) {
            // Wait a bit for content to render, then scroll
            setTimeout(() => {
                const commentSection = document.getElementById("comments");
                if (commentSection) {
                    commentSection.scrollIntoView({ behavior: "smooth", block: "start" });
                }
            }, 300);
        }
    }, [loading, id]);

    

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="flex flex-col items-center justify-center mt-20 lg:mt-40">
                    <div className="  p-5 py-10 lg:w-180 lg:p-20">
                        <p className="text-center">Loading...</p>
                    </div>
                </div>
            </>
        );
    }

    if (!post) {
        return (
            <>
                <Navbar />
                <div className="flex flex-col items-center justify-center mt-20 lg:mt-40">
                    <div className="bg-brown-200 w-85 rounded-2xl p-5 py-10 lg:w-180 lg:p-20">
                        <h1 className="text-2xl font-semibold text-center pb-5">Post not found</h1>
                        <div className="flex justify-center">
                            <Link to="/" className="bg-brown-600 rounded-3xl text-white text-sm font-medium py-2 px-6">
                                Back to Home
                            </Link>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    // Format content (simple markdown-like formatting)
    const formatContent = (content) => {
        if (!content) return "";
        return content.split('\n').map((line, index) => {
            if (line.startsWith('## ')) {
                return <h2 key={index} className="text-2xl font-bold mt-6 mb-3">{line.replace('## ', '')}</h2>;
            }
            if (line.trim() === '') {
                return <br key={index} />;
            }
            return <p key={index} className="mb-4 text-brown-600">{line}</p>;
        });
    };

    return (
        <>
            <Navbar />
            {/* Image */}
            <div className=" h-[212px] w-full sm:h-[360px] lg:h-[500px] lg:w-full lg:px-30 mx-auto mt-12 lg:mt-30  relative ">
                            <img
                                className="w-full h-full lg:rounded-2xl object-cover "
                                src={post.image}
                                alt={post.title}
                            />
                        </div>
            
            <div className="flex flex-col lg:grid lg:grid-cols-[1fr_280px] items-start  mt-10 lg:mt-20 px-4 lg:px-30 gap-6">
                <div className=" rounded-2xl pb-5  lg:w-full">
                    <div className="flex flex-col gap-6 ">
                        {/* Category and Date */}
                        <div className="flex items-center gap-3">
                            <span className="bg-green-200 rounded-full px-3 py-1 text-sm font-semibold text-green-600">
                                {post.category}
                            </span>
                            {post.date && (
                                <span className="text-sm text-brown-500">
                                    {post.date}
                                </span>
                            )}
                        </div>

                        {/* Title */}
                        <h1 className="text-3xl lg:text-4xl font-bold">{post.title}</h1>

                        {/* Description */}
                        <p className="text-lg text-brown-600">{post.description}</p>

                        {/* Content */}
                        {post.content && (
                            <div className="prose mx-auto ">
                                {formatContent(post.content)}
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Author */}
                <div className=" lg:flex flex-col mb-10 text-sm bg-brown-200 rounded-2xl p-5 py-10 mx-auto lg:sticky lg:top-30 lg:self-start lg:w-64 lg:z-30">
                            <div className="flex justify-start">
                                <img
                                    className="w-8 h-8 rounded-full mr-2"
                                    src="https://res.cloudinary.com/dcbpjtd1r/image/upload/v1728449784/my-blog-post/xgfy0xnvyemkklcqodkg.jpg"
                                    alt={post.author}
                                />
                                <div className="">
                                    <p className="text-xs  text-brown-600">Author:</p>
                                    <span>{post.author}</span>
                                </div>

                            </div>
                            <hr className="my-4 border-brown-300" />
                            <p className="">I am a pet enthusiast and freelance writer who specializes in animal behavior and care. With a deep love for cats, I enjoy sharing insights on feline companionship and wellness.
                                <br />
                                <br />
                                When i’m not writing, I spends time volunteering at my local animal shelter, helping cats find loving homes.</p>


                </div>
            </div>
            
            <div className="flex flex-col gap-5 py-5 items-center justify-center  bg-brown-200 lg:w-195 lg:flex-row lg:ml-30 lg:rounded-2xl ">
                <button
                    className={`text-sm text-brown-600 bg-white border w-85 h-12 rounded-4xl flex items-center justify-center transition-colors ${
                        isLiked ? "bg-green-100 border-green-400" : "hover:bg-brown-100"
                    } ${loadingLike ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                    onClick={async () => {
                        if (!isLoggedIn) {
                            setShowAccountPrompt(true);
                            return;
                        }
                        if (loadingLike) return;

                        try {
                            setLoadingLike(true);
                            const response = await apiClient.post(`/posts/${id}/like`);
                            setIsLiked(response.data.liked);
                            // Refresh like count
                            const likesResponse = await apiClient.get(`/posts/${id}/likes`);
                            setLikeCount(likesResponse.data.count || 0);
                            // แจ้งให้ Navbar และหน้า Notification ดึงแจ้งเตือนใหม่ (รวม like ที่เพิ่งสร้าง)
                            window.dispatchEvent(new Event("notificationsRefresh"));
                        } catch (err) {
                            if (err.response?.status === 401) {
                                localStorage.removeItem("token");
                                localStorage.removeItem("isLoggedIn");
                                setIsLoggedIn(false);
                                setShowAccountPrompt(true);
                            }
                        } finally {
                            setLoadingLike(false);
                        }
                    }}
                    disabled={loadingLike}
                >
                    {isLiked ? "❤️" : "🙂"}{likeCount}
                </button>
                <div className="flex gap-3">
                <span 
                    className="bg-white w-40 h-12 border rounded-4xl flex items-center justify-center cursor-pointer hover:bg-brown-100 transition-colors"
                    onClick={handleCopyLink}
                >
                    {isCopied ? "Copied!" : "Copy link"}
                </span>
                <img 
                    src={facebookicon} 
                    alt="Share on Facebook" 
                    className="cursor-pointer hover:opacity-70 transition-opacity" 
                    onClick={handleShareFacebook}
                />
                <img 
                    src={twittericon} 
                    alt="Share on Twitter" 
                    className="cursor-pointer hover:opacity-70 transition-opacity" 
                    onClick={handleShareTwitter}
                />
                <img 
                    src={linkedinicon} 
                    alt="Share on LinkedIn" 
                    className="cursor-pointer hover:opacity-70 transition-opacity" 
                    onClick={handleShareLinkedIn}
                />
                </div>
            </div>
            <div className="flex flex-col items-center lg:items-start py-10 px-4 lg:px-30">
                <div className="w-85 lg:w-180" id="comments">
                    <h2 className="text-xl font-semibold mb-6">Comment</h2>
                    
                    {/* Comment Input */}
                    {isLoggedIn ? (
                        <div className="flex flex-col gap-3 mb-8">
                            <textarea
                                placeholder="What are your thoughts?"
                                className="w-full p-4 rounded-md border border-brown-300 text-sm bg-white text-brown-600 resize-none"
                                rows="4"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                disabled={loadingComment}
                            />
                            <div className="flex justify-start">
                                <button
                                    onClick={async () => {
                                        if (!comment.trim() || loadingComment) return;
                                        if (!isLoggedIn) {
                                            setShowAccountPrompt(true);
                                            return;
                                        }

                                        try {
                                            setLoadingComment(true);
                                            const response = await apiClient.post(`/posts/${id}/comments`, {
                                                content: comment.trim(),
                                            });
                                            
                                            // Add new comment to list
                                            const newComment = {
                                                id: response.data.id,
                                                text: response.data.content,
                                                author: response.data.author_name || response.data.username || "User",
                                                date: response.data.created_at 
                                                    ? new Date(response.data.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
                                                    : new Date().toLocaleDateString(),
                                                profilePic: response.data.profile_pic || null,
                                            };
                                            setComments([newComment, ...comments]);
                                            setComment("");
                                        } catch (err) {
                                            if (err.response?.status === 401) {
                                                localStorage.removeItem("token");
                                                localStorage.removeItem("isLoggedIn");
                                                setIsLoggedIn(false);
                                                setShowAccountPrompt(true);
                                            } else {
                                                const errorMsg = err.response?.data?.message || err.response?.data?.error || "Failed to create comment. Please try again.";
                                                alert(errorMsg);
                                            }
                                        } finally {
                                            setLoadingComment(false);
                                        }
                                    }}
                                    disabled={loadingComment || !comment.trim()}
                                    className="bg-brown-600 rounded-3xl text-white text-sm font-medium py-2 px-6 hover:bg-brown-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loadingComment ? "Sending..." : "Send"}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="mb-8 p-4 bg-brown-100 rounded-lg border border-brown-300">
                            <p className="text-sm text-brown-600 mb-3">Please login to comment</p>
                            <div className="flex gap-2">
                                <Link
                                    to="/login"
                                    className="bg-brown-600 rounded-3xl text-white text-sm font-medium py-2 px-6 hover:bg-brown-700 transition-colors"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/signup"
                                    className="bg-white border border-brown-600 rounded-3xl text-brown-600 text-sm font-medium py-2 px-6 hover:bg-brown-50 transition-colors"
                                >
                                    Sign up
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* Comments List */}
                    <div className="flex flex-col gap-4">
                        {comments.length === 0 ? (
                            <p className="text-brown-500 text-center py-8">No comments yet. Be the first to comment!</p>
                        ) : (
                            comments.map((commentItem) => (
                                <div key={commentItem.id} className="bg-white rounded-2xl p-5 border border-brown-300">
                                    <div className="flex items-start gap-3 mb-2">
                                        {commentItem.profilePic ? (
                                            <img
                                                className="w-8 h-8 rounded-full object-cover"
                                                src={commentItem.profilePic}
                                                alt={commentItem.author}
                                            />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-brown-200 border border-brown-300 flex items-center justify-center">
                                                <span className="text-xs text-brown-600 font-semibold">
                                                    {commentItem.author.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-semibold text-sm">{commentItem.author}</span>
                                                <span className="text-xs text-brown-400">{commentItem.date}</span>
                                            </div>
                                            <p className="text-sm text-brown-600">{commentItem.text}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {showAccountPrompt && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="bg-brown-200 rounded-2xl p-8 flex flex-col items-center gap-4 w-85 lg:w-96">
                        <div className="text-center text-lg font-semibold">Create an account to continue</div>
                        <Link to="/signup" className="bg-brown-600 rounded-3xl text-white text-sm font-medium py-2 px-6 hover:bg-brown-700 transition-colors">Create account</Link>
                        <p className="text-center text-xs ">Already have an account? <Link to="/login" className="text-brown-600 underline">Login</Link></p>
                        <button 
                            onClick={() => setShowAccountPrompt(false)}
                            className="text-brown-500 text-xs mt-2 hover:text-brown-700"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            <Footer />                     
        </>
    );
}

export default CardDetail;