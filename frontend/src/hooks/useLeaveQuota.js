import { useEffect, useState } from "react";

export const useLeaveQuota = (leaveTypeId) => {
  const [quotaMap, setQuotaMap] = useState({});
  const [loadingQuota, setLoadingQuota] = useState(false);

  useEffect(() => {
    const fetchQuota = async () => {
      setLoadingQuota(true);
      try {
        const res = await fetch("/api/leave-requests/quota", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await res.json();

        const mapped = {};
        data.forEach((q) => {
          mapped[q.leave_type_id] = q;
        });
        setQuotaMap(mapped);
      } catch (err) {
        console.error("Error fetching quota:", err);
      } finally {
        setLoadingQuota(false);
      }
    };

    fetchQuota();
  }, []);

  const selectedQuota = leaveTypeId ? quotaMap[leaveTypeId] ?? null : null;

  const remainingDays =
    selectedQuota &&
    selectedQuota.total_days != null &&
    selectedQuota.used_days != null
      ? Number(selectedQuota.total_days) - Number(selectedQuota.used_days)
      : null;

  return { loadingQuota, selectedQuota, remainingDays };
};
