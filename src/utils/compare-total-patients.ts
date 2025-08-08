export const compareTotalPatientsBetweenMonth = (data: any) => {
    const currentMonth = new Date().getMonth();
    const previousMonth = new Date(
      new Date().setMonth(currentMonth - 1)
    ).getMonth();
    const currentMonthData = data?.data?.filter(
      (item: any) => new Date(item.createdDate).getMonth() === currentMonth
    );
    const previousMonthData = data?.data?.filter(
      (item: any) => new Date(item.createdDate).getMonth() === previousMonth
    );

    let percentage = 0;
    if (previousMonthData?.length > 0) {
      percentage =
        ((currentMonthData?.length - previousMonthData?.length) /
          previousMonthData?.length) *
        100;
    } else if (currentMonthData?.length > 0) {
      percentage = 100;
    }

    return {
      currentMonth: currentMonthData?.length,
      previousMonth: previousMonthData?.length,
      percentage: Math.round(percentage * 100) / 100,
    };
  };
