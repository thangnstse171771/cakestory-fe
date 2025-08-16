// Mock data for posts
export const generatePosts = (count = 20) => {
  const cakeTypes = [
    "Chocolate",
    "Vanilla",
    "Strawberry",
    "Red Velvet",
    "Carrot",
    "Lemon",
    "Coffee",
    "Tiramisu",
    "Cheesecake",
    "Black Forest",
  ];

  const cakeImages = [
    "https://scientificallysweet.com/wp-content/uploads/2020/09/IMG_4117-feature.jpg",
    "https://static01.nyt.com/images/2023/10/27/multimedia/27cakerex-plzm/27cakerex-plzm-superJumbo.jpg",
    "https://food.fnr.sndimg.com/content/dam/images/food/fullset/2009/4/5/1/IG1C17_30946_s4x3.jpg.rend.hgtvcom.1280.1280.suffix/1433541424559.webp",
    "https://flouringkitchen.com/wp-content/uploads/2023/07/BW1A4089-2.jpg",
    "https://stylesweet.com/wp-content/uploads/2022/06/ChocolateCakeForTwo_Featured.jpg",
  ];

  const userNames = [
    "CakeMaster",
    "SweetBaker",
    "PastryPro",
    "CakeArtist",
    "BakingQueen",
    "SugarArtist",
    "CakeDesigner",
    "SweetTooth",
    "CakeLover",
    "BakingPro",
  ];

  const badges = ["Design"];

  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    user: {
      id: index % 2 === 0 ? "1" : "2",
      name: userNames[Math.floor(Math.random() * userNames.length)],
      avatar: `https://i.pravatar.cc/150?img=${index + 1}`,
      badge:
        Math.random() > 0.7
          ? badges[Math.floor(Math.random() * badges.length)]
          : null,
    },
    image: cakeImages[Math.floor(Math.random() * cakeImages.length)],
    likes: Math.floor(Math.random() * 2000) + 100,
    comments: Math.floor(Math.random() * 200) + 10,
    description: `Just finished this beautiful ${
      cakeTypes[Math.floor(Math.random() * cakeTypes.length)]
    } cake! #cake #baking #${cakeTypes[
      Math.floor(Math.random() * cakeTypes.length)
    ].toLowerCase()}cake`,
    timeAgo: `${Math.floor(Math.random() * 24)} hours ago`,
  }));
};

// Mock data for trending topics
export const generateTrendingTopics = (count = 10) => {
  const topics = [
    "trending",
    "buttercream",
    "tutorial",
    "chocolatecake",
    "heartcake",
    "fondant",
    "weddingcake",
    "birthdaycake",
    "cupcakes",
    "cakedecorating",
  ];

  return Array.from({ length: count }, (_, index) => ({
    name: `#${topics[index]}`,
    posts: `${Math.floor(Math.random() * 1000) + 1} posts`,
  }));
};

// Mock data for suggestion groups
export const generateSuggestionGroups = (count = 10) => {
  const groupNames = [
    "Cake Decorating Beginner",
    "Professional Bakers Network",
    "Fondant Artistry",
    "Wedding Cake Designers",
    "Cupcake Masters",
    "Sugar Flower Artists",
    "Cake Business Owners",
    "Home Bakers Community",
    "Cake Photography",
    "Cake Competition Enthusiasts",
  ];

  return Array.from({ length: count }, (_, index) => ({
    name: groupNames[index],
    members: `${Math.floor(Math.random() * 10000) + 100} members`,
  }));
};

// Mock data for upcoming events
export const generateUpcomingEvents = (count = 10) => {
  const eventTypes = [
    "Virtual Cake Decorating Workshop",
    "Baking Competition",
    "Cake Design Masterclass",
    "Sugar Flower Workshop",
    "Business of Baking Seminar",
    "Cake Photography Workshop",
    "Wedding Cake Design Course",
    "Fondant Art Workshop",
    "Cake Business Marketing",
    "Advanced Piping Techniques",
  ];

  const generateDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + Math.floor(Math.random() * 30));
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return Array.from({ length: count }, (_, index) => ({
    name: eventTypes[index],
    date: generateDate(),
  }));
};
