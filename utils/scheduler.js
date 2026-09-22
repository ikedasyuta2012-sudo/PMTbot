// 指定時刻に「毎日繰り返し」メッセージを送信するための仕組み（システム部分）

const crypto = require('crypto');

// 実行中のジョブを保持（Bot再起動で消える点に注意）
// jobId -> { timeoutId, intervalId, timeStr, content, channelId, guildId }
const activeJobs = new Map();

function getDelayUntil(timeStr) {
  const match = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(timeStr.trim());
  if (!match) {
    throw new Error('時刻は "HH:MM" 形式で指定してください（例: 09:30, 21:00）');
  }

  const [, hourStr, minuteStr] = match;
  const hour = Number(hourStr);
  const minute = Number(minuteStr);

  const now = new Date();
  const target = new Date(now);
  target.setHours(hour, minute, 0, 0);

  if (target.getTime() <= now.getTime()) {
    target.setDate(target.getDate() + 1);
  }

  return target.getTime() - now.getTime();
}

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

/**
 * 指定時刻に毎日繰り返しメッセージを送信するジョブを登録する。
 * ※ Botを再起動するとジョブは消えます（メモリ管理のため）。永続化が必要なら別途対応します。
 */
function scheduleRecurringMessage({ channel, content, timeStr }) {
  const delay = getDelayUntil(timeStr);
  const jobId = crypto.randomUUID().slice(0, 8);

  const send = async () => {
    try {
      await channel.send(content);
    } catch (err) {
      console.error(`メッセージ送信に失敗しました (job ${jobId}):`, err);
    }
  };

  const timeoutId = setTimeout(() => {
    send();
    // 初回送信後、以降は24時間ごとに送信し続ける
    const intervalId = setInterval(send, ONE_DAY_MS);
    const job = activeJobs.get(jobId);
    if (job) job.intervalId = intervalId;
  }, delay);

  activeJobs.set(jobId, {
    timeoutId,
    intervalId: null,
    timeStr,
    content,
    channelId: channel.id,
    guildId: channel.guildId ?? null,
  });

  return { jobId, delay };
}

function cancelJob(jobId) {
  const job = activeJobs.get(jobId);
  if (!job) return false;

  clearTimeout(job.timeoutId);
  if (job.intervalId) clearInterval(job.intervalId);
  activeJobs.delete(jobId);
  return true;
}

function listJobs(guildId) {
  return [...activeJobs.entries()]
    .filter(([, job]) => job.guildId === guildId)
    .map(([jobId, job]) => ({ jobId, ...job }));
}

module.exports = { getDelayUntil, scheduleRecurringMessage, cancelJob, listJobs };
