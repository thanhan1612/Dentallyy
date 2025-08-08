import dayjs from "dayjs"

const ageCalculate = (day: string | Date): number => {
  const today = dayjs()
  const dob = dayjs(day)
  return today.diff(dob, 'year')
}

export default ageCalculate
