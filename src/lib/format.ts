export function formatDuration(totalSeconds: number): string {
  const seconds = Math.max(0, Math.round(totalSeconds));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainder = seconds % 60;
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
  }
  return `${minutes}:${String(remainder).padStart(2, "0")}`;
}

export function formatDate(iso: string, lang: "en" | "zh"): string {
  const [year, month, day] = iso.split("-").map(Number);
  if (!year || !month || !day) return iso;
  if (lang === "zh") return `${year}年${month}月${day}日`;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[month - 1]} ${day}, ${year}`;
}

export function periodId(year: number): string {
  if (year < 1995) return "1980-1994";
  if (year <= 2009) return "1995-2009";
  if (year <= 2014) return "2010-2014";
  if (year <= 2019) return "2015-2019";
  if (year <= 2022) return "2020-2022";
  return String(year);
}

export function periodLabel(id: string): string {
  return id.replace("-", "–");
}
