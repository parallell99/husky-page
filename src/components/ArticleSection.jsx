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
import { selectData } from "@/data/select";



function ArticleSection() {
  return (
    <>
      <div className=" my-10 lg:mx-20">
        <p className="text-2xl font-semibold pl-3 py-4">Latest articles</p>
        <div className="flex flex-col justify-center items-center w-full py-10 bg-brown-200 lg:flex-row-reverse lg:h-[80px] lg:rounded-2xl lg:px-5">
          <div className="grid w-full px-5 lg:w-[560px]">
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
          <div className="lg:hidden  w-full px-5">
            <Select>
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder="Highlight"
                  className="text-sm font-medium text-brown-400"
                />
              </SelectTrigger>
              <SelectContent>
                {selectData.map((item, index) => (
                  <SelectGroup key={index}>
                    <SelectLabel>{item}</SelectLabel>
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex max-lg:hidden gap-2">
            {selectData.map((item, index) => (
              <Button
                key={index}
                className="hover:bg-brown-300 text-brown-500 cursor-pointer"
              >
                {item}
              </Button>
            ))}

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
