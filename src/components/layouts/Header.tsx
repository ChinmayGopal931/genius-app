import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/shadcn/sheet";

import { mainMenu } from "@/config/menu";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { Logo } from "../logo";
import { Accordion } from "@radix-ui/react-accordion";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../shadcn/Accordion";

export function Header() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="mt-8 flex h-[80px] justify-between">
      <div className="flex items-center mb-5">
        <Sheet open={open} onOpenChange={setOpen}>
          <div className="xs-sm-hidden:block sm:block md:hidden lg:hidden xl:hidden 2xl:hidden">
            <SheetTrigger>
              <div className="mr-6">
                <img
                  src="/assets/genius.png"
                  className="w-[7rem]"
                  alt="Genius Mobile"
                />
              </div>
            </SheetTrigger>
          </div>

          <div className="">
            <div className="flex items-center space-x-2 py-10 xs-sm-hidden:hidden md:block sm:hidden lg:block xl:block 2xl:block">
              <NavLink
                to="/"
                className="mr-6 flex items-center space-x-2 py-10"
              >
                <Logo />
              </NavLink>
            </div>
          </div>

          <nav className="flex items-center space-x-8 text-xl xs-sm-hidden:hidden md:block sm:hidden lg:block xl:block 2xl:block">
            {mainMenu.map((menu, index) => (
              <NavLink
                key={index}
                to={menu.to ?? ""}
                className={({ isActive }) =>
                  cn(
                    "text-xl font-medium transition-colors hover:text-primary",
                    isActive ? "text-foreground" : "text-foreground/60"
                  )
                }
              >
                {menu.title}
              </NavLink>
            ))}
          </nav>

          <SheetContent side="left" className="pr-0 sm:max-w-xs">
            <NavLink
              to="/"
              onClick={() => setOpen(false)}
              className="flex items-center space-x-2"
            >
              <img src="/assets/GeniusMobileShort.svg" className="w-[40%]" />
            </NavLink>

            <ScrollArea className="my-4 h-[calc(100vh-8rem)] pb-8 pl-8">
              <Accordion
                type="single"
                collapsible
                className="w-full"
                defaultValue={
                  "item-" +
                  mainMenu.findIndex((item) =>
                    item.items !== undefined
                      ? item.items
                          .filter((subitem) => subitem.to !== undefined)
                          .map((subitem) => subitem.to)
                          .includes(location.pathname)
                      : false
                  )
                }
              >
                <div className="flex flex-col space-y-3">
                  {mainMenu.map((menu, index) =>
                    menu.items !== undefined ? (
                      <AccordionItem
                        key={index}
                        value={`item-${index}`}
                        className="border-b-0 pr-6"
                      >
                        <AccordionTrigger
                          className={cn(
                            "py-1 hover:no-underline hover:text-primary [&[data-state=open]]:text-primary",
                            menu.items
                              .filter((subitem) => subitem.to !== undefined)
                              .map((subitem) => subitem.to)
                              .includes(location.pathname)
                              ? "text-foreground"
                              : "text-foreground/60"
                          )}
                        >
                          <div className="flex">{menu.title}</div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-1 pl-4">
                          <div className="mt-1">
                            {menu.items.map((submenu, subindex) =>
                              submenu.to !== undefined ? (
                                <NavLink
                                  key={subindex}
                                  to={submenu.to}
                                  onClick={() => setOpen(false)}
                                  className={({ isActive }) =>
                                    cn(
                                      "block justify-start py-1 h-auto font-normal hover:text-primary",
                                      isActive
                                        ? "text-foreground"
                                        : "text-foreground/60"
                                    )
                                  }
                                >
                                  {submenu.title}
                                </NavLink>
                              ) : submenu.label !== "" ? null : (
                                <div className="px-3"></div>
                              )
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ) : (
                      <NavLink
                        key={index}
                        to={menu.to ?? ""}
                        onClick={() => setOpen(false)}
                        className={({ isActive }) =>
                          cn(
                            "py-1 text-lg font-medium transition-colors hover:text-primary",
                            isActive ? "text-foreground" : "text-foreground/60"
                          )
                        }
                      >
                        {menu.title}
                      </NavLink>
                    )
                  )}
                </div>
              </Accordion>
            </ScrollArea>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
