import React from "react";
import firstPost from "../assets/firstPost.png"
import secondPost from "../assets/secondPost.png"
export default function SocialFeed() {
  // Example static data
  const posts = [
    { id: 1, title: "Design", img: firstPost },
    { id: 2, title: "3d Model", img: secondPost },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-12">
      <h1 className="text-3xl sm:text-4xl font-bold mb-8 text-center text-gray-800">
        Social Feed
      </h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map(post => (
          <div
            key={post.id}
            className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <img
              src={post.img}
              alt={post.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h2 className="text-lg font-semibold text-gray-800">{post.title}</h2>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
