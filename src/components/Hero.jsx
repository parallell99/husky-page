import heroImage from "../assets/image/section.jpg";
function Hero() {
  return (
    <section className="flex flex-col items-center justify-center gap-5 px-3 lg:flex-row  lg:py-15 lg:px-20 mt-[50px]  lg:gap-10">
      <div className="flex flex-col items-center justify-center lg:hidden">
        <h1 className="text-4xl  py-5 text-center font-bold leading-10 ">
          Stay Informed, Stay Inspired
        </h1>
        <h2 className="text-sm text-center px-5 font-medium text-brown-400">
          Discover a World of Knowledge at Your Fingertips. Your Daily Dose of
          Inspiration and Information.
        </h2>
      </div>

      <div className="flex flex-col items-center justify-center max-lg:hidden  lg:w-[374px]">
        <h1 className="text-5xl  py-5 text-center font-semibold leading-15 lg:text-end w-full">
          Stay <br /> Informed,
          <br /> Stay Inspired
        </h1>
        <h2 className="text-sm text-center font-medium text-brown-400 lg:text-end">
          Discover a World of Knowledge at Your <br /> Fingertips. Your Daily
          Dose of Inspiration and Information.
        </h2>
      </div>

      <div className="  max-w-[350px] h-[470px] flex items-center justify-center rounded-2xl overflow-hidden lg:max-w-[386px] lg:h-[530px]">
        <img
          src={heroImage}
          alt="Hero section"
          className="object-cover w-full h-full invert-20 relative"
        />
      </div>
      <div className="lg:w-[374px] lg:h-[284px]">
        <p className="text-xs py-3 text-brown-400">-Author</p>
        <p className="text-2xl pb-3 text-brown-600 font-semibold">
          Thompson P.
        </p>
        <p className="text-sm text-brown-400 font-medium">
          I am a pet enthusiast and freelance writer who specializes in animal
          behavior and care. With a deep love for cats, I enjoy sharing insights
          on feline companionship and wellness. When i’m not writing, I spends
          time volunteering at my local animal shelter, helping cats find loving
          homes.
          <br />
          <br />
          <br />
          When i’m not writing, I spends time volunteering at my local animal
          shelter, helping cats find loving homes.
        </p>
      </div>
    </section>
  );
}

export default Hero;
