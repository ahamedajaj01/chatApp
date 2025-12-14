import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { searchUsers } from "../chatSlice";

export default function useChatSearch() {
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchStatus, setSearchStatus] = useState(null);
  const [searchError, setSearchError] = useState(null);

  const DEBOUNCE_MS = 500;
  const MIN_SEARCH_LENGTH = 3;
  const debounceRef = useRef(null);
  const lastDispatchRef = useRef(null);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }

    const trimmed = String(searchQuery || "").trim();
    if (!trimmed || trimmed.length < MIN_SEARCH_LENGTH) {
      if (lastDispatchRef.current) {
        lastDispatchRef.current.abort?.();
        lastDispatchRef.current = null;
      }
      setSearchResults([]);
      setSearchStatus(null);
      setSearchError(null);
      return;
    }

    debounceRef.current = setTimeout(() => {
      if (lastDispatchRef.current) {
        lastDispatchRef.current.abort?.();
        lastDispatchRef.current = null;
      }

      setSearchStatus("loading");
      const p = dispatch(searchUsers(trimmed));
      lastDispatchRef.current = p;

      p.then((res) => {
        setSearchResults(res.payload || []);
        setSearchStatus("idle");
      })
        .catch((err) => {
          setSearchError(err);
          setSearchStatus("error");
        })
        .finally(() => {
          if (lastDispatchRef.current === p) lastDispatchRef.current = null;
        });
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
    };
  }, [searchQuery, dispatch]);

  useEffect(() => {
    return () => {
      if (lastDispatchRef.current) {
        lastDispatchRef.current.abort?.();
        lastDispatchRef.current = null;
      }
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
    };
  }, []);

  return { searchQuery, setSearchQuery, searchResults, searchStatus, searchError };
}
