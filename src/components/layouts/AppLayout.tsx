import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";

export function AppLayout() {
  return (
    <div>
      <div className="px-[20%] xs-sm-hidden:px-8 flex-grow flex flex-col">
        <Header />
      </div>

      <div className="flex-grow md:px-[1%] sm:px-[5%] lg:px-[10%] xl:px-[5%] 2xl:px-[15%] flex flex-col">
        <div className="md:px-[15%] px-[5%] flex-grow flex flex-col">
          <Outlet />
        </div>
      </div>
      <div className="p-10 px-4 md:px-8">
        <Footer />
      </div>
    </div>
  );
}
