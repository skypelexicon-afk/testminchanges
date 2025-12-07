'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Share2, Link as LinkIcon, MessageCircle, MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';

interface ShareTestButtonProps {
  testId: number;
  testName: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export default function ShareTestButton({ 
  testId, 
  testName, 
  variant = 'outline', 
  size = 'sm',
  className = '' 
}: ShareTestButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getTestUrl = () => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/student/dashboard/tests/test-instructions/${testId}`;
  };

  const handleCopyLink = async () => {
    try {
      const url = getTestUrl();
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
      setIsOpen(false);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const handleWhatsAppShare = () => {
    const url = getTestUrl();
    const message = `Hey there! Give this test to check your preparation:\n${url}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    setIsOpen(false);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        const url = getTestUrl();
        await navigator.share({
          title: testName,
          text: `Check out this test: ${testName}`,
          url: url,
        });
        setIsOpen(false);
      } catch (error) {
        // User cancelled share or share failed
        if ((error as Error).name !== 'AbortError') {
          toast.error('Failed to share');
        }
      }
    } else {
      toast.error('Share not supported on this device');
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={variant} 
          size={size} 
          className={className}
          data-testid={`share-test-${testId}`}
        >
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem 
          onClick={handleCopyLink}
          data-testid="share-copy-link"
        >
          <LinkIcon className="h-4 w-4 mr-2" />
          Copy Link
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={handleWhatsAppShare}
          data-testid="share-whatsapp"
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          Share on WhatsApp
        </DropdownMenuItem>
        {navigator.share && (
          <DropdownMenuItem 
            onClick={handleNativeShare}
            data-testid="share-native"
          >
            <MoreHorizontal className="h-4 w-4 mr-2" />
            Share via...
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
