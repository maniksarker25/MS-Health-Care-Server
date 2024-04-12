export type TSchedule = {
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
};

export type TScheduleFilterRequest = {
  startDate?: string;
  endDate?: string;
};
