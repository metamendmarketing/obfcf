"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useStore } from "@/lib/store";

export function PresenceManager() {
  const activeAuditId = useStore(state => state.activeAuditId);
  const currentUser = useStore(state => state.currentUser);
  const [channel, setChannel] = useState<any>(null);

  useEffect(() => {
    const room = supabase.channel('app-presence', {
      config: {
        presence: {
          key: currentUser?.username || 'anonymous',
        },
      },
    });

    room
      .on('presence', { event: 'sync' }, () => {
        const state = room.presenceState();
        const activeEditors: Record<string, string[]> = {};
        
        for (const [key, presences] of Object.entries(state)) {
          for (const p of presences as any[]) {
            if (p.activeAuditId && p.username) {
              if (!activeEditors[p.activeAuditId]) {
                activeEditors[p.activeAuditId] = [];
              }
              if (!activeEditors[p.activeAuditId].includes(p.username)) {
                activeEditors[p.activeAuditId].push(p.username);
              }
            }
          }
        }
        
        // Update global state with the merged editors
        useStore.setState({ activeEditors });
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          setChannel(room);
        }
      });

    return () => {
      supabase.removeChannel(room);
      setChannel(null);
    };
  }, [currentUser?.username]);

  // Track state changes
  useEffect(() => {
    if (channel && currentUser) {
      if (activeAuditId) {
        channel.track({
          username: currentUser.username,
          activeAuditId: activeAuditId,
          onlineAt: new Date().toISOString(),
        });
      } else {
        channel.untrack();
      }
    }
  }, [channel, activeAuditId, currentUser]);

  return null; // Hidden component
}
