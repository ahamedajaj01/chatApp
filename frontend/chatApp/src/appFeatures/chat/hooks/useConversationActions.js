import { useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import { hideConversation } from "../chatSlice";

export default function useConversationActions({ optimistic = false } = {}) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const hide = useCallback(
    async (conversationId, { onSuccess, onError, onFinally } = {}) => {
      if (!conversationId) return;

      setLoading(true);
      setError(null);

      try {
        // dispatch thunk and wait for completion
        const resultAction = await dispatch(hideConversation(conversationId));
        if (resultAction.error) {
          throw resultAction.error;
        }
        // Success hook
        onSuccess?.(conversationId, resultAction.payload);
        return resultAction.payload;
      } catch (error) {
        setError(error?.message || error);
      }
    },
    [dispatch, optimistic]
  );

  return {
    hideConversation: hide,
    loading,
    error,
  };
}
