"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useGetMessagesQuery } from "@/Redux/Reducers/ClientPanel/ManageSalons/Messages/MessagesApi";
import {
  Message,
  MessageCustomer,
} from "@/Types/ClientPanel/ManageSalonTypes/MessagesTypes/MessagesTypes";
import { format } from "date-fns";
import { Bot, Loader2, MessageCircle, Phone, User } from "lucide-react";
import { useParams } from "next/navigation";
import React, {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Extract alphabetic initials from names that may contain emoji */
function getInitials(firstName: string, lastName: string): string {
  const alpha = (s: string) =>
    [...s].find((c) => /[a-zA-Z]/.test(c))?.toUpperCase() ?? "";
  return alpha(firstName) + alpha(lastName) || "?";
}

/** Convert **bold** and \n to React nodes */
function parseMarkdown(text: string): React.ReactNode {
  const segments = text.split(/(\*\*[^*]+\*\*)/g);
  return segments.map((seg, i) => {
    if (seg.startsWith("**") && seg.endsWith("**")) {
      return <strong key={i}>{seg.slice(2, -2)}</strong>;
    }
    return seg.split("\n").map((line, j, arr) => (
      <Fragment key={`${i}-${j}`}>
        {line}
        {j < arr.length - 1 && <br />}
      </Fragment>
    ));
  });
}

const PAGE_SIZE = 20;

type ConversationEntry = {
  customer: MessageCustomer;
  lastMessage: Message;
  unread: number;
};

// ─── Component ───────────────────────────────────────────────────────────────

const MessagesTab: React.FC = () => {
  const { salonuid } = useParams();
  const salonUid = Array.isArray(salonuid) ? salonuid[0] : (salonuid ?? "");

  const [page, setPage] = useState(1);
  const [allMessages, setAllMessages] = useState<Message[]>([]);
  const [selectedUid, setSelectedUid] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);
  const prevScrollHeightRef = useRef(0);
  const isFirstLoadRef = useRef(true);
  const prevCountRef = useRef(0);
  const isInitializedRef = useRef(false);

  const {
    data: fetched,
    isLoading,
    isFetching,
  } = useGetMessagesQuery(
    { salonUid, page },
    { pollingInterval: page === 1 ? 5000 : 0 },
  );

  // ── Merge pages ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!fetched) return;

    if (fetched.length < PAGE_SIZE) setHasMore(false);

    setAllMessages((prev) => {
      const key = (m: Message) => `${m.customer.uid}::${m.sent_at}`;

      if (page === 1) {
        // Polling refresh: merge new bottom messages
        const prevSet = new Set(prev.map(key));
        const genuinelyNew = fetched.filter((m) => !prevSet.has(key(m)));
        if (genuinelyNew.length === 0 && prev.length > 0) return prev;
        const fetchedSet = new Set(fetched.map(key));
        const olderPages = prev.filter((m) => !fetchedSet.has(key(m)));
        return [...olderPages, ...fetched];
      } else {
        // Prepend older page
        const fetchedSet = new Set(fetched.map(key));
        const existing = prev.filter((m) => !fetchedSet.has(key(m)));
        return [...fetched, ...existing];
      }
    });

    setIsLoadingMore(false);
  }, [fetched]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Auto-select first customer ────────────────────────────────────────────
  useEffect(() => {
    if (!selectedUid && allMessages.length > 0) {
      setSelectedUid(allMessages[allMessages.length - 1].customer.uid);
    }
  }, [allMessages, selectedUid]);

  // ── Scroll to bottom on first load / new polled messages ─────────────────
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !selectedUid) return;

    const msgs = allMessages.filter((m) => m.customer.uid === selectedUid);

    if (isFirstLoadRef.current && msgs.length > 0) {
      el.scrollTop = el.scrollHeight;
      isFirstLoadRef.current = false;
      isInitializedRef.current = true;
      prevCountRef.current = msgs.length;
      return;
    }

    if (msgs.length > prevCountRef.current) {
      const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 150;
      if (nearBottom) el.scrollTop = el.scrollHeight;
      prevCountRef.current = msgs.length;
    }
  }, [allMessages, selectedUid]);

  // ── Restore scroll after loading older messages ───────────────────────────
  useEffect(() => {
    if (!isLoadingMore && prevScrollHeightRef.current > 0) {
      const el = scrollRef.current;
      if (el) {
        el.scrollTop = el.scrollHeight - prevScrollHeightRef.current;
        prevScrollHeightRef.current = 0;
      }
    }
  }, [isLoadingMore, allMessages]);

  // ── Scroll listener – reaching top triggers load more ──────────────────────
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleScroll = () => {
      if (!isInitializedRef.current || !hasMore || isLoadingMore || isFetching)
        return;

      if (el.scrollTop < 80) {
        prevScrollHeightRef.current = el.scrollHeight;
        setIsLoadingMore(true);
        setPage((p) => p + 1);
      }
    };

    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [hasMore, isLoadingMore, isFetching]);

  // ── Select conversation ───────────────────────────────────────────────────
  const handleSelect = useCallback((uid: string) => {
    setSelectedUid(uid);
    isFirstLoadRef.current = true;
    prevCountRef.current = 0;
    // scroll to bottom after state update
    setTimeout(() => {
      const el = scrollRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    }, 50);
  }, []);

  // ── Derive conversations list ─────────────────────────────────────────────
  const conversations = useMemo<ConversationEntry[]>(() => {
    const map = new Map<
      string,
      { customer: MessageCustomer; lastMessage: Message; unread: number }
    >();

    allMessages.forEach((msg) => {
      const uid = msg.customer.uid;
      const entry = map.get(uid);
      const isNewer =
        !entry || new Date(msg.sent_at) > new Date(entry.lastMessage.sent_at);

      map.set(uid, {
        customer: msg.customer,
        lastMessage: isNewer ? msg : entry!.lastMessage,
        unread: (entry?.unread ?? 0) + (msg.role === "CUSTOMER" ? 1 : 0),
      });
    });

    return Array.from(map.values()).sort(
      (a, b) =>
        new Date(b.lastMessage.sent_at).getTime() -
        new Date(a.lastMessage.sent_at).getTime(),
    );
  }, [allMessages]);

  // ── Filtered + sorted messages for selected conversation ──────────────────
  const selectedMessages = useMemo(
    () =>
      allMessages
        .filter((m) => m.customer.uid === selectedUid)
        .sort(
          (a, b) =>
            new Date(a.sent_at).getTime() - new Date(b.sent_at).getTime(),
        ),
    [allMessages, selectedUid],
  );

  const selectedCustomer = conversations.find(
    (c) => c.customer.uid === selectedUid,
  )?.customer;

  // ─── Skeleton loading state ──────────────────────────────────────────────
  if (isLoading && allMessages.length === 0) {
    return (
      <div className="border-border bg-card flex h-[calc(100vh-200px)] overflow-hidden rounded-xl border shadow-sm">
        {/* sidebar skeletons */}
        <div className="border-border flex w-80 shrink-0 flex-col gap-0 space-y-1 border-r p-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl p-3">
              <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          ))}
        </div>
        {/* message area skeletons */}
        <div className="flex flex-1 flex-col gap-4 p-5">
          {[false, true, false, false, true, false].map((right, i) => (
            <div
              key={i}
              className={cn(
                "flex items-end gap-2",
                right ? "flex-row-reverse" : "flex-row",
              )}
            >
              <Skeleton className="h-7 w-7 shrink-0 rounded-full" />
              <Skeleton
                className={cn("h-10 rounded-2xl", right ? "w-44" : "w-64")}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ─── Main render ─────────────────────────────────────────────────────────
  return (
    <div className="border-border bg-card flex h-[calc(100vh-200px)] overflow-hidden rounded-xl border shadow-sm">
      {/* ── LEFT: conversation list ────────────────────────────────────── */}
      <div className="border-border bg-background flex w-80 shrink-0 flex-col border-r">
        {/* Header */}
        <div className="border-border flex items-center gap-2 border-b px-4 py-3.5">
          <MessageCircle className="text-primary h-5 w-5" />
          <span className="text-foreground text-sm font-semibold">
            Messages
          </span>
          {conversations.length > 0 && (
            <Badge variant="secondary" className="ml-auto h-5 px-1.5 text-xs">
              {conversations.length}
            </Badge>
          )}
        </div>

        <ScrollArea className="flex-1">
          {conversations.length === 0 && (
            <div className="text-muted-foreground flex h-40 flex-col items-center justify-center gap-2 p-4 text-sm">
              <MessageCircle className="h-8 w-8 opacity-25" />
              <span>No conversations yet</span>
            </div>
          )}

          {conversations.map(({ customer, lastMessage }) => {
            const isSelected = customer.uid === selectedUid;
            const initials = getInitials(
              customer.first_name,
              customer.last_name,
            );

            return (
              <button
                key={customer.uid}
                onClick={() => handleSelect(customer.uid)}
                className={cn(
                  "border-border/40 flex w-full items-center gap-3 border-b px-4 py-3 text-left transition-all",
                  isSelected
                    ? "bg-primary/10 border-l-primary border-l-[3px]"
                    : "hover:bg-muted/60 border-l-[3px] border-l-transparent",
                )}
              >
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarFallback className="bg-primary/15 text-primary text-sm font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-foreground truncate text-sm font-semibold">
                      {customer.first_name} {customer.last_name}
                    </span>
                    <span className="text-muted-foreground shrink-0 text-[10px]">
                      {format(new Date(lastMessage.sent_at), "HH:mm")}
                    </span>
                  </div>

                  <div className="mt-0.5 flex items-center gap-1">
                    {lastMessage.role === "BOT" && (
                      <Bot className="text-muted-foreground/60 h-3 w-3 shrink-0" />
                    )}
                    <p className="text-muted-foreground truncate text-xs">
                      {lastMessage.message}
                    </p>
                  </div>

                  <div className="mt-1 flex items-center gap-1.5">
                    <Badge
                      variant="outline"
                      className="h-4 px-1.5 py-0 text-[9px] font-normal"
                    >
                      {customer.source}
                    </Badge>
                    <span className="text-muted-foreground truncate text-[10px]">
                      {customer.phone}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </ScrollArea>
      </div>

      {/* ── RIGHT: message thread ──────────────────────────────────────── */}
      <div className="bg-background flex min-w-0 flex-1 flex-col">
        {/* Chat header */}
        <div className="border-border bg-card flex min-h-[57px] items-center gap-3 border-b px-4 py-3">
          {selectedCustomer ? (
            <>
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className="bg-primary/15 text-primary text-sm font-bold">
                  {getInitials(
                    selectedCustomer.first_name,
                    selectedCustomer.last_name,
                  )}
                </AvatarFallback>
              </Avatar>

              <div>
                <p className="text-foreground text-sm leading-tight font-semibold">
                  {selectedCustomer.first_name} {selectedCustomer.last_name}
                </p>
                <div className="text-muted-foreground mt-0.5 flex items-center gap-1.5 text-xs">
                  <Phone className="h-3 w-3" />
                  <span>{selectedCustomer.phone}</span>
                  <span>·</span>
                  <Badge
                    variant="outline"
                    className="h-4 px-1.5 py-0 text-[9px]"
                  >
                    {selectedCustomer.source}
                  </Badge>
                </div>
              </div>
            </>
          ) : (
            <p className="text-muted-foreground text-sm">
              Select a conversation
            </p>
          )}
        </div>

        {/* Messages scroll area ──────────────────────────────────────── */}
        <div
          ref={scrollRef}
          className="flex-1 space-y-2 overflow-y-auto px-4 py-4"
          style={{
            background:
              "repeating-linear-gradient(135deg, transparent, transparent 23px, hsl(var(--border)/0.3) 23px, hsl(var(--border)/0.3) 24px)",
          }}
        >
          {/* Load-more indicator */}
          {isLoadingMore && (
            <div className="flex justify-center pb-2">
              <div className="text-muted-foreground bg-card/90 border-border inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs shadow-sm backdrop-blur-sm">
                <Loader2 className="h-3 w-3 animate-spin" />
                Loading earlier messages…
              </div>
            </div>
          )}

          {/* Empty state */}
          {!selectedUid && (
            <div className="text-muted-foreground flex h-full flex-col items-center justify-center gap-3">
              <MessageCircle className="h-12 w-12 opacity-20" />
              <p className="text-sm">Select a conversation to view messages</p>
            </div>
          )}

          {/* Message rows */}
          {selectedMessages.map((msg, index) => {
            const isBot = msg.role === "BOT";
            const prevMsg = selectedMessages[index - 1];
            const showDate =
              index === 0 ||
              format(new Date(prevMsg.sent_at), "yyyy-MM-dd") !==
                format(new Date(msg.sent_at), "yyyy-MM-dd");

            return (
              <Fragment key={`${msg.sent_at}-${msg.role}-${index}`}>
                {/* Date separator */}
                {showDate && (
                  <div className="my-4 flex items-center gap-3">
                    <div className="bg-border/60 h-px flex-1" />
                    <span className="text-muted-foreground bg-card/80 border-border/60 rounded-full border px-2.5 py-0.5 text-[10px] shadow-sm backdrop-blur-sm">
                      {format(new Date(msg.sent_at), "MMMM d, yyyy")}
                    </span>
                    <div className="bg-border/60 h-px flex-1" />
                  </div>
                )}

                {/* Message row */}
                <div
                  className={cn(
                    "flex items-end gap-2",
                    isBot ? "flex-row" : "flex-row-reverse",
                  )}
                >
                  {/* Avatar (BOT = robot icon, CUSTOMER = initials) */}
                  {isBot ? (
                    <div className="bg-primary/10 border-border mb-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border shadow-sm">
                      <Bot className="text-primary h-4 w-4" />
                    </div>
                  ) : (
                    <Avatar className="mb-1 h-7 w-7 shrink-0 shadow-sm">
                      <AvatarFallback className="bg-secondary/20 text-secondary text-xs font-bold">
                        {getInitials(
                          msg.customer.first_name,
                          msg.customer.last_name,
                        )}
                      </AvatarFallback>
                    </Avatar>
                  )}

                  {/* Bubble + metadata */}
                  <div
                    className={cn(
                      "flex max-w-[65%] flex-col",
                      isBot ? "items-start" : "items-end",
                    )}
                  >
                    {/* Customer info header (CUSTOMER only) */}
                    {!isBot && (
                      <div className="mb-1 flex items-center gap-1.5 px-1">
                        <User className="text-muted-foreground h-3 w-3" />
                        <span className="text-foreground text-xs font-semibold">
                          {msg.customer.first_name} {msg.customer.last_name}
                        </span>
                        <span className="text-muted-foreground text-[10px]">
                          {msg.customer.phone}
                        </span>
                      </div>
                    )}

                    {/* Bubble */}
                    <div
                      className={cn(
                        "px-3.5 py-2.5 text-sm leading-relaxed shadow-sm",
                        isBot
                          ? "bg-card border-border text-foreground rounded-2xl rounded-bl-sm border"
                          : "bg-secondary rounded-2xl rounded-br-sm text-white",
                      )}
                    >
                      {isBot ? (
                        <div className="whitespace-pre-wrap">
                          {parseMarkdown(msg.message)}
                        </div>
                      ) : (
                        msg.message
                      )}
                    </div>

                    {/* Timestamp */}
                    <span className="text-muted-foreground mt-1 px-1 text-[10px]">
                      {format(new Date(msg.sent_at), "HH:mm")}
                    </span>
                  </div>
                </div>
              </Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MessagesTab;
