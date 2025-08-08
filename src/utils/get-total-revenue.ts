const getTotalRevenue = (data:any) =>{
  const completedTreatments = data?.data?.filter(treatment => treatment?.status === 'completed');
  const currentMonth = new Date().getMonth();
  const previousMonth = new Date(
      new Date().setMonth(currentMonth - 1)
    ).getMonth();
    const currentMonthData = completedTreatments?.filter(
      (item: any) => new Date(item?.payment?.date).getMonth() === currentMonth
    );
    const previousMonthData = completedTreatments?.filter(
      (item: any) => new Date(item?.payment?.date).getMonth() === previousMonth
    );

    const getTotalAmount = (items: any[]) => {
      return items?.reduce((acc: number, item: any) => {
        if (!item?.payment?.paid) {
          return acc;
        }
       const totalPaidForItem = item.payment.paid.reduce((itemTotal: number, paidEntry: string) => {
        try {
          const parsedPaid = JSON.parse(paidEntry);
          const paidAmount = Number(parsedPaid.paid_amount || 0);
          return itemTotal + paidAmount;
        } catch (error) {
          console.error('Error parsing paid entry:', paidEntry);
          return itemTotal;
        }
      }, 0);
      
      return acc + totalPaidForItem;
    }, 0);
    };

    const currentMonthRevenue = getTotalAmount(currentMonthData);
    const previousMonthRevenue = getTotalAmount(previousMonthData);
    let totalRevenue = 0;
    let percentage = 0;
    if (previousMonthData?.length > 0) {
      totalRevenue = currentMonthRevenue - previousMonthRevenue;
      percentage =
        ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) *
        100;
    } else if (currentMonthData?.length > 0) {
      totalRevenue = currentMonthRevenue;
      percentage = 100;
    }

    return {
      currentMonth: currentMonthRevenue,
      previousMonth: previousMonthRevenue,
      totalRevenue: totalRevenue,
      percentage: Math.round(percentage * 100) / 100,
    };
  };
export default getTotalRevenue;