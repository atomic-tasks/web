import type { ReactNode } from "react";

import { ScreenHeader } from "../../shared/ui/ScreenHeader";
import { ExplorerPage } from "./ExplorerPage";
import { QueryStatus } from "./QueryStatus";
import { useRootFolder } from "./useRootFolder";

export interface ExplorerRootProps {
  showClosed: boolean;
  actions?: ReactNode;
}

/** «Проводник» без адреса папки: дожидается id корня и показывает его. */
export function ExplorerRoot({ showClosed, actions }: ExplorerRootProps) {
  const root = useRootFolder();
  if (!root.data) {
    return (
      <>
        <ScreenHeader title="Проводник" actions={actions} />
        <div className="Explorer-body">
          <QueryStatus
            isPending={root.isPending}
            error={root.error}
            onRetry={() => {
              void root.refetch();
            }}
          />
        </div>
      </>
    );
  }
  return <ExplorerPage folderId={root.data.id} showClosed={showClosed} actions={actions} />;
}
