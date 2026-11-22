import type { ReactNode } from "react";
import { Dialog, Heading, Modal as AriaModal, ModalOverlay } from "react-aria-components";

import "./Modal.css";

export interface ModalProps {
  /** Заголовок окна; он же имя диалога для скринридера. */
  title: string;
  onClose: () => void;
  children: ReactNode;
}

/** Модальное окно (React Aria): фокус внутри, закрытие по Esc и клику на фон. Показывается, пока смонтировано. */
export function Modal({ title, onClose, children }: ModalProps) {
  return (
    <ModalOverlay
      isOpen
      isDismissable
      className="Modal-overlay"
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <AriaModal className="Modal">
        <Dialog className="Modal-dialog">
          <Heading slot="title" className="Modal-title">
            {title}
          </Heading>
          {children}
        </Dialog>
      </AriaModal>
    </ModalOverlay>
  );
}
