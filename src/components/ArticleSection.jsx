import { SearchIcon } from "lucide-react";
import { BlogCard } from "./BlogCard";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";
import { blogPosts } from "@/data/blogPost";

function ArticleSection() {
  return (
    <>
      <div className=" my-10 lg:mx-20">
        <p className="text-2xl font-semibold pl-3 py-4">Latest articles</p>
        <div className="flex flex-col justify-center items-center w-full py-10 bg-brown-200 lg:flex-row-reverse lg:h-[80px] lg:rounded-2xl lg:px-5">
          <div className="grid w-[343px] max-w-sm lg:w-[560px] bg-white">
            <InputGroup>
              <InputGroupInput
                placeholder="Search"
                className="text-sm font-medium text-brown-600 w-full"
              />
              <InputGroupAddon>
                <SearchIcon />
              </InputGroupAddon>
            </InputGroup>
          </div>
          <div className="flex flex-col justify-start items-start w-full pl-3">
            <p className="text-sm font-medium text-brown-400 lg:hidden pt-3 pb-1">
              Category
            </p>
          </div>
          <div className="lg:hidden bg-white">
            <Select>
              <SelectTrigger className="w-[343px]">
                <SelectValue
                  placeholder="Highlight"
                  className="text-sm font-bold text-brown-400"
                />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Fruits</SelectLabel>
                  <SelectItem value="apple">Apple</SelectItem>
                  <SelectItem value="banana">Banana</SelectItem>
                  <SelectItem value="blueberry">Blueberry</SelectItem>
                  <SelectItem value="grapes">Grapes</SelectItem>
                  <SelectItem value="pineapple">Pineapple</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="flex max-lg:hidden gap-2">
            <Button className="hover:bg-brown-300 text-brown-500 cursor-pointer">
              Highlight
            </Button>
            <Button className="hover:bg-brown-300 text-brown-500 cursor-pointer">
              Cat
            </Button>
            <Button className="hover:bg-brown-300 text-brown-500 cursor-pointer">
              Inspiration
            </Button>
            <Button className="hover:bg-brown-300 text-brown-500 cursor-pointer">
              Ganeral
            </Button>
          </div>
        </div>
      </div>
      <div className="px-3 py-3 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:px-20">
        {blogPosts.map((post) => (
          <BlogCard
            key={post.id}
            image={post.image}
            category={post.category}
            title={post.title}
            description={post.description}
            author={post.author}
            date={post.date}
          />
        ))}
      </div>
    </>
  );
}

export default ArticleSection;
