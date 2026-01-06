import logo1 from "../assets/image/Github_black.svg";
import logo2 from "../assets/image/Google_black.svg";
import logo3 from "../assets/image/LinkedIN_black.svg";

function Footer() {
  return (
    <footer className="flex flex-col items-center justify-center gap-5 py-10 bg-brown-200 lg:flex-row lg:justify-around">
      <div className="flex justify-center items-center gap-10">
        <div className="font-medium">Get in touch</div>
        <div className="flex gap-5">
          <img src={logo1} alt="" className="" />
          <img src={logo2} alt="" className="" />
          <img src={logo3} alt="" className="" />
        </div>
      </div>
      <a href="#" className="underline font-medium">
        Home page
      </a>
    </footer>
  );
}

export default Footer;
