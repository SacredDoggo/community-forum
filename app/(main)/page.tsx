"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";

import { fetchFeed } from "@/db/api-controller";
import { Spinner } from "@/components/spinner";

import { Post } from "@prisma/client";
import PostContentLoader from "./_component/post-content-loader";


const HomePage = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const observerRef = useRef<HTMLDivElement | null>(null);

  const { user, isLoaded } = useUser();
  const router = useRouter();

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
  }, [cursor, loading, !!user, isLoaded]);

  const handleClickOnPost = (post_id: string) => {
    router.push(`/post/${post_id}`);
  }

  if (!isLoaded) {
    return <div className="flex h-full w-full items-center justify-center">
      <Spinner size="lg" />
    </div>
  }

  return (
    <div className="flex flex-col h-full w-full items-center p-4">
      <div className="flex flex-col w-full max-w-[768px] gap-y-4">
        {posts.map((post, index) => (
          <div
            key={post.id + index}
            className="bg-[#f1f1f1] rounded-md p-4 max-h-[200px] overflow-y-hidden cursor-pointer"
            onClick={() => handleClickOnPost(post.id)}
          >
            <h2 className="font-semibold h-10 lg:h-12 text-2xl lg:text-3xl">{post.title}</h2>
            <PostContentLoader content={post.content} />
          </div>
        ))}
        {cursor && (
          <div ref={observerRef} style={{ height: "20px", background: "transparent" }} />
        )}
        {loading && <p>Loading...</p>}
      </div>
      {
        loading && <div className="flex h-full items-center justify-center">
          <Spinner size="lg" />
        </div>
      }
    </div >
  );
};

export default HomePage;
