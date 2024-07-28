interface AppConfig {
  name: string;
  github: {
    title: string;
    url: string;
  };
  author: {
    name: string;
    url: string;
  };
}

export const appConfig: AppConfig = {
  name: "",
  github: {
    title: "Genius",
    url: "https://github.com/Geniusfi/",
  },
  author: {
    name: "Genius",
    url: "https://github.com/Geniusfi/",
  },
};
