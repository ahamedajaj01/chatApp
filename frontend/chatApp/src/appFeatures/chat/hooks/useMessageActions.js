import { useDispatch } from "react-redux";
import { useState, useCallback, useMemo } from "react";
import { deleteMessageForMe } from "../chatSlice";

function useMessageActions() {
  const dispatch = useDispatch();

  const deleteMessage = useCallback(
    async ({ conversationId, messageId } = {}) => {
      if (!conversationId || !messageId) {
        return {
          ok: false,
          error: new Error("conversationId and messageId are required"),
        };
      }
      try {
        const result = await dispatch(
          deleteMessageForMe({ conversationId, messageId })
        );
        return { ok: true, data: result };
      } catch (error) {
        return { ok: true, error };
      }
    },
    [dispatch]
  );

const handlers = useMemo(
    ()=>({
        delete:deleteMessage
    }),
    [deleteMessage]
)

const run = useCallback(
    async (actionName, payload) =>{
        const fn = handlers[actionName]
        if (!fn) throw new Error(`Unknown action ${actionName}`)
            return fn(payload)
    },
    [handlers]
)

  return {handlers, run, deleteMessage};
}

export default useMessageActions;
