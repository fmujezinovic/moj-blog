"use client";

import Link from "next/link";
import { FaYoutube, FaFacebookF, FaTiktok } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6"; 


export default function Footer() {
  return (
    <footer className="bg-background border-t border-border py-8 mt-12">
      <div className="max-w-5xl mx-auto px-6 flex flex-col items-center space-y-4">
        <div className="flex space-x-6">
          <Link href="https://www.youtube.com/@farismujezinovic8771" target="_blank" rel="noopener noreferrer">
            <FaYoutube className="w-6 h-6 hover:text-primary transition-colors" />
          </Link>
          <Link href="https://x.com/drmujezinovic" target="_blank" rel="noopener noreferrer">
            <FaXTwitter className="w-6 h-6 hover:text-primary transition-colors" />
          </Link>
          <Link href="https://www.facebook.com/faris.mujezinovic.37" target="_blank" rel="noopener noreferrer">
            <FaFacebookF className="w-6 h-6 hover:text-primary transition-colors" />
          </Link>
          <Link href="https://www.tiktok.com/@fmhqd" target="_blank" rel="noopener noreferrer">
            <FaTiktok className="w-6 h-6 hover:text-primary transition-colors" />
          </Link>
        </div>
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Faris Mujezinović. Vse pravice pridržane.
        </p>
      </div>
    </footer>
  );
}
