import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { useTranslation } from "react-i18next";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { switchSavedTopic } from "../../api/topics.js";
import ActionMenu from "../PopupMenus/ActionMenu.jsx";
import ToastPortal from "../Toast/Toast.jsx";
import deleteIcon from "../../assets/delete-context-menu.svg";
import copyIcon from "../../assets/copy-icon.svg";
import savePlusIcon from "../../assets/save-plus.svg";
import saveMinusIcon from "../../assets/save-minus.svg";

export default function TopicActionMenu({
  positionX,
  positionY,
  isToggled,
  actionMenuRef,
  resetActionMenu,
  actionMenu,
  onDeleteClick,
  isTopicSaved,
}) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { currentUser } = useAuth();
  const [toast, setToast] = useState(null);

  const switchSavedMutation = useMutation({
    mutationFn: ({ user_id, topic }) => switchSavedTopic({ user_id, topic }),
    onMutate: async ({ topic }) => {
      const previousData = queryClient.getQueryData([
        "savedTopics",
        currentUser?.uid,
      ]);

      queryClient.setQueryData(["savedTopics", currentUser?.uid], oldData => {
        if (!oldData) return { pages: [{ topics: [topic] }], pageParams: [] };

        const isAlreadySaved = oldData.pages.some(page =>
          page.topics.some(t => t.id === topic.id)
        );

        return {
          ...oldData,
          pages: oldData.pages.map((page, index) => ({
            ...page,
            topics: isAlreadySaved
              ? page.topics.filter(t => t.id !== topic.id)
              : index === 0
              ? [topic, ...page.topics]
              : page.topics,
          })),
        };
      });
      return { previousData };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(
        ["savedTopics", currentUser?.uid],
        context.previousData
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["savedTopics", currentUser?.uid]);
    },
  });

  const handleCopyClick = topicId => {
    navigator.clipboard.writeText(
      `${window.location.origin}/topics/${topicId}`
    );

    if (toast) clearTimeout(toast.timeoutId);

    setToast({
      message: t("topic.copiedToClipboard"),
      type: "success",
      timeoutId: setTimeout(() => setToast(null), 3000),
    });
  };

  const buttons = [
    {
      text: t("delete"),
      icon: deleteIcon,
      onClick:
        actionMenu.selectedTopicItem?.author === currentUser?.uid
          ? () => {
              onDeleteClick(actionMenu.selectedTopic);
            }
          : null,
    },
    {
      text: isTopicSaved ? t("topic.unsaveTopic") : t("topic.saveTopic"),
      icon: isTopicSaved ? saveMinusIcon : savePlusIcon,
      onClick:
        currentUser && actionMenu.selectedTopicItem?.author !== currentUser.uid
          ? () =>
              switchSavedMutation.mutate({
                user_id: currentUser.uid,
                topic: actionMenu.selectedTopicItem,
              })
          : null,
    },
    {
      text: t("topic.copyUrl"),
      icon: copyIcon,
      onClick: () => handleCopyClick(actionMenu.selectedTopicItem.id),
    },
  ].filter(button => button.onClick);
  return (
    <>
      <ActionMenu
        positionX={positionX}
        positionY={positionY}
        isToggled={isToggled}
        actionMenuRef={actionMenuRef}
        buttons={buttons}
        resetActionMenu={resetActionMenu}
      />
      {toast && (
        <ToastPortal
          message={toast.message}
          type={toast.type}
          item={toast.item}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}
