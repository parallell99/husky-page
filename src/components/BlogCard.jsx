import { Link } from "react-router-dom";

export function BlogCard(props) {
  const { id, image, category, title, description, author, authorProfilePic, date } = props;
  return (
    <div className="flex flex-col gap-4 py-3">
      <Link to={`/post/${id}`} className="relative h-[212px] sm:h-[360px]">
        <img
          className="w-full h-full object-cover rounded-md"
          src={image}
          alt={title}
        />
      </Link>
      <div className="flex flex-col">
        <div className="flex">
          <span className="bg-green-200 rounded-full px-3 py-1 text-sm font-semibold text-green-600 mb-2">
            {category}
          </span>
        </div>
        <Link to={`/post/${id}`}>
          <h2 className="text-start font-bold text-xl mb-2 line-clamp-2 hover:underline">
            {title}
          </h2>
        </Link>
        <p className="text-muted-foreground text-sm mb-4  line-clamp-3">
          {description}
        </p>
        <div className="flex flex-wrap items-center text-sm">
          {authorProfilePic ? (
            <img
              className="w-8 h-8 rounded-full mr-2 object-cover"
              src={authorProfilePic}
              alt={author}
            />
          ) : (
            <div className="w-8 h-8 rounded-full mr-2 bg-brown-200 flex items-center justify-center text-brown-600 text-xs font-medium shrink-0">
              {author ? author.charAt(0).toUpperCase() : "?"}
            </div>
          )}
          <span>{author}</span>
          <span className="mx-2 text-gray-300">|</span>
          <span>{date}</span>
        </div>
      </div>
    </div>
  );
}
