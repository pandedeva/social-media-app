"use client";
import { useUser } from "@clerk/nextjs";
import React, { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Avatar, AvatarImage } from "./ui/avatar";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { ImageIcon, Loader2Icon, SendIcon } from "lucide-react";
import { createPost } from "@/actions/post.actions";
import toast from "react-hot-toast";

const CreatePost = () => {
  const { user } = useUser();
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim() && !imageUrl) return;

    setIsPosting(true);
    try {
      const result = await createPost(content, imageUrl);

      if (result.success) {
        // reset the form
        setContent("");
        setImageUrl("");
        setShowImageUpload(false);

        // toast berguna seperti alert!
        toast.success("Post Created successfully");
      }
    } catch (error) {
      console.log("Failed to create post:", error);
      toast.error("Failed to create post");
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <>
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex space-x-4">
              <Avatar className="w-10 h-10">
                <AvatarImage src={user?.imageUrl} alt="avatar" />
              </Avatar>
              <Textarea
                placeholder="What's on your mind?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={isPosting}
              />
            </div>

            {/* todo: handle img upload */}
            <div className="flex justify-between items-center border-t pt-4">
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-primary"
                  onClick={() => setShowImageUpload(!showImageUpload)}
                  disabled={isPosting}
                >
                  <ImageIcon className="mr-2 size-4" />
                </Button>
              </div>

              <Button
                className="flex items-center"
                onClick={handleSubmit}
                disabled={isPosting || (!content.trim() && !imageUrl)}
              >
                {isPosting ? (
                  <>
                    <Loader2Icon className="mr-2 size-4 animate-spin" />
                    Posting...
                  </>
                ) : (
                  <>
                    <SendIcon className="mr-2 size-4" />
                    Post
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default CreatePost;
