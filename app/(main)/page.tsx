"use client";

import React, { useEffect, useRef, useState } from "react";

import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";

import { fetchFeed } from "@/db/api-controller";
import { Spinner } from "@/components/spinner";

import { Post } from "@prisma/client";


const HomePage = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const observerRef = useRef<HTMLDivElement | null>(null);

  const { user, isLoaded } = useUser();

  const fetchPosts = async () => {
    if (loading) return;

    setLoading(true);
    try {
      const response = await fetchFeed({
        user_id: user ? user.id : null,
        cursor
      });

      if (!response || response.status != 200) {
        toast.error("Couldn't fetch feed");
        throw new Error;
      }

      setPosts((prev) => [...prev, ...response.data.posts!]);
      setCursor(response.data.nextCursor!);
    } catch (error) {
      console.log("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(); // Initial fetch
  }, []);

  useEffect(() => {
    if (!observerRef.current || !cursor) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && cursor != null) {
          fetchPosts();
        }
      },
      { threshold: 1.0 }
    );

    observer.observe(observerRef.current);

    return () => observer.disconnect();
  }, [cursor, loading, isLoaded]);

  if (!isLoaded) {
    return <div className="flex h-full w-full items-center justify-center">
      <Spinner size="lg" />
    </div>
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col">
        {posts.map((post) => (
          <div key={post.id} style={{ marginBottom: "20px" }}>
            <h2>{post.title}</h2>
            <p>{post.content}</p>
          </div>
        ))}
        {cursor && (
          <div ref={observerRef} style={{ height: "20px", background: "transparent" }} />
        )}
        {loading && <p>Loading...</p>}
      </div>
      {loading && <div className="flex h-full items-center justify-center">
        <Spinner size="lg" />
      </div>}
    </div>
  );
};

export default HomePage;
