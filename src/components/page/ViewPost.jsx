import Navbar from "../Navbar";
import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { blogPosts as fallbackPosts } from "../../data/blogPost";
import facebookicon from "../../assets/image/Facebook_black.svg"
import twittericon from "../../assets/image/Twitter_black.svg"
import linkedinicon from "../../assets/image/LinkedIN_black2.svg"
import Footer from "../Footer";
import { useCopyToClipboard } from "../../hooks/use-copy-to-clipboard";


function CardDetail() {
    const { id } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [comment, setComment] = useState("");
    const [comments, setComments] = useState([]);
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

    useEffect(() => {
        const fetchPost = async () => {
            try {
                // Try to fetch from API first
                const response = await axios.get(`https://blog-post-project-api.vercel.app/${id}`, {
                    timeout: 3000
                });

                // Handle different response formats
                let postData = null;
                if (response.data) {
                    if (Array.isArray(response.data)) {
                        postData = response.data.find(p => p.id === parseInt(id)) || response.data[0];
                    } else if (response.data.id) {
                        postData = response.data;
                    } else if (response.data.post) {
                        postData = response.data.post;
                    } else if (response.data.data) {
                        postData = response.data.data;
                    }
                }

                if (postData) {
                    setPost(postData);
                } else {
                    // Fallback to local data
                    const localPost = fallbackPosts.find(p => p.id === parseInt(id));
                    setPost(localPost || null);
                }
            } catch (error) {
                console.error("Error fetching post:", error.message);
                // Fallback to local data
                const localPost = fallbackPosts.find(p => p.id === parseInt(id));
                setPost(localPost || null);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchPost();
        }
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
            
            <div className="flex flex-col lg:grid lg:grid-cols-[1fr_280px] items-start w-full mt-10 lg:mt-20 px-4 lg:px-30 gap-6">
                <div className=" rounded-2xl pb-5 lg:w-full">
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
                            <div className="prose max-w-none">
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
                <p 
                    className="text-sm text-brown-600 bg-white border w-85 h-12 rounded-4xl flex items-center justify-center cursor-pointer hover:bg-brown-100 transition-colors"
                    onClick={() => setShowAccountPrompt(!showAccountPrompt)}
                >
                    🙂{post.like || post.likes || 0}
                </p>
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
                    <div className="flex flex-col gap-3 mb-8">
                        <textarea
                            placeholder="What are your thoughts?"
                            className="w-full p-4 rounded-md border border-brown-300 text-sm bg-white text-brown-600 resize-none"
                            rows="4"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        />
                        <div className="flex justify-start">
                            <button
                                onClick={() => {
                                    if (comment.trim()) {
                                        setComments([...comments, {
                                            id: Date.now(),
                                            text: comment,
                                            author: "You",
                                            date: new Date().toLocaleDateString()
                                        }]);
                                        setComment("");
                                    }
                                }}
                                className="bg-brown-600 rounded-3xl text-white text-sm font-medium py-2 px-6 hover:bg-brown-700 transition-colors"
                            >
                                Send
                            </button>
                        </div>
                    </div>

                    {/* Comments List */}
                    <div className="flex flex-col gap-4">
                        {comments.length === 0 ? (
                            <p className="text-brown-500 text-center py-8">No comments yet. Be the first to comment!</p>
                        ) : (
                            comments.map((commentItem) => (
                                <div key={commentItem.id} className="bg-white rounded-2xl p-5 border border-brown-300">
                                    <div className="flex items-start gap-3 mb-2">
                                        <img
                                            className="w-8 h-8 rounded-full"
                                            src="https://res.cloudinary.com/dcbpjtd1r/image/upload/v1728449784/my-blog-post/xgfy0xnvyemkklcqodkg.jpg"
                                            alt={commentItem.author}
                                        />
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