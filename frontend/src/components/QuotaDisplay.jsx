import React from "react";

const QuotaDisplay = ({ loadingQuota, selectedQuota, remainingDays }) => {
  if (loadingQuota) {
    return <p>Loading quota...</p>;
  }

  if (!selectedQuota) {
    return <p>No quota data available for this leave type.</p>;
  }

  const isUnlimited = Number(selectedQuota.total_days) === -1;

  return (
    <>
      <p>
        <strong>Total Quota:</strong>{" "}
        {isUnlimited ? "Unlimited" : `${selectedQuota.total_days} days`}
      </p>
      <p>
        <strong>Used:</strong>{" "}
        {isUnlimited ? "-" : `${selectedQuota.used_days ?? 0} days`}
      </p>
      <p>
        <strong>Remaining:</strong>{" "}
        {isUnlimited
          ? "Unlimited"
          : Number.isFinite(remainingDays)
          ? `${remainingDays} days`
          : "N/A"}
      </p>
    </>
  );
};

export default QuotaDisplay;
