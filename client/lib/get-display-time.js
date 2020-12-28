export default function getDisplayTime(timeInput) {
  let time = timeInput;
  const min = Math.floor(time / 60000);
  time = time - (min * 60000);
  const sec = Math.floor(time / 1000).toString(10);
  time = time - (sec * 1000);
  const hundreths = Math.floor(time / 10).toString(10);
  let displayedSec;
  sec.length === 1 ? displayedSec = '0' + sec : displayedSec = sec;
  let displayedHundreths;
  hundreths.length === 1 ? displayedHundreths = '0' + hundreths : displayedHundreths = hundreths;
  const displayedTime = `${min}:${displayedSec}.${displayedHundreths}`;

  return displayedTime;
}
