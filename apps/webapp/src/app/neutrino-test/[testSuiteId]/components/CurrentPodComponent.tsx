import { getPassedTimeAsString } from '@/app/utils';
import { ChipView } from '@/components/CustomViews';
import { TestContainer } from '@/types/testSuiteTypes';
import { TaskStatus } from '@neutrino-package/supabase/types';
import React from 'react';
import { getChipViewStylebyTaskStatus, getStatusColor, } from '../utils';

const CurrentPodComponent = ({ recentTestRun, activeTestRun, setLogViewId, className = "" }: CurrentPodComponentProps) => {
  const showLogs = () => {
    console.log(recentTestRun);
    if (recentTestRun?.dockerContainerId) {
      setLogViewId(recentTestRun.dockerContainerId);
    }
  };
  return (
    <div className={`${className} border border-gray-300 rounded-lg bg-white flex flex-wrap mb-4`}>
      <div className={`w-1 mr-4 rounded-l-lg ${getStatusColor(recentTestRun?.taskStatus)}`} />
      <div className="flex-1 space-y-2 pr-4 pt-3 pb-2">
        <div className="flex justify-between items-center">
          <span className="font-semibold text-gray-800">{activeTestRun ? "Active" : "Recent"} Test</span>
          <ChipView className={`mr-0 text-xs uppercase font-bold ${getChipViewStylebyTaskStatus(recentTestRun?.taskStatus)}`}>{recentTestRun?.taskStatus}</ChipView>
        </div>
        <div className="text-sm text-gray-600">{recentTestRun?.jobName}</div>
        {recentTestRun?.taskStatus == TaskStatus.FAILED && (<div className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded flex flex-col">
          <span className="font-semibold text-gray-800 mb-2">Error</span>
          <span className="text-xs" >{recentTestRun?.errorMessage}</span>
        </div>)}
        <div className="border-t pt-2 text-xs text-gray-600 flex items-center flex-wrap gap-2">
          <span className="px-2 py-1 bg-gray-100 rounded">{recentTestRun?.environment}</span>
          <span className="ml-auto text-gray-400">{getPassedTimeAsString(recentTestRun?.startTime)}</span>
          <a className="text-blue-600 hover:underline cursor-pointer" onClick={showLogs}>View Logs</a>
        </div>
      </div>
    </div>
  );
};

interface CurrentPodComponentProps {
  recentTestRun: TestContainer | undefined;
  activeTestRun: Boolean;
  setLogViewId: React.Dispatch<React.SetStateAction<string | null>>;
  className?: string;
}

export default CurrentPodComponent;
