import { afterEach, describe, expect, it } from "vitest";
import {
  applyOperationsAction,
  operationsStoreMode,
  readOperationsState,
} from "./operations-store";
import { permissionForAction } from "./operations-access";

const memoryGlobal = globalThis as typeof globalThis & {
  __gbnOperationsState?: unknown;
};

afterEach(() => {
  delete process.env.OPERATIONS_STORE;
  delete memoryGlobal.__gbnOperationsState;
});

describe("operations-store: モード判定", () => {
  it("未設定時は local(従来デモ)になる", async () => {
    expect(operationsStoreMode()).toBe("local");
    expect(await readOperationsState()).toBeNull();
    expect(
      await applyOperationsAction({ type: "clear_announcement" }),
    ).toBeNull();
  });

  it("不正な値は local 扱いになる", () => {
    process.env.OPERATIONS_STORE = "invalid";
    expect(operationsStoreMode()).toBe("local");
  });
});

describe("operations-store: memory ストア", () => {
  it("操作を適用した状態が次回の読み取りへ永続する", async () => {
    process.env.OPERATIONS_STORE = "memory";

    const initial = await readOperationsState();
    expect(initial?.announcement.active).toBe(false);

    const updated = await applyOperationsAction({
      type: "publish_announcement",
      level: "emergency",
      message: "強風のため一時中断します",
    });
    expect(updated?.announcement).toMatchObject({
      active: true,
      level: "emergency",
      message: "強風のため一時中断します",
    });

    // 別リクエスト相当の読み取りでも反映されている(複数端末同期の根拠)
    const reread = await readOperationsState();
    expect(reread?.announcement.message).toBe("強風のため一時中断します");
  });
});

describe("operations-access: 操作とロール権限の対応", () => {
  it("操作種別が正しい権限キーへ対応する", () => {
    expect(
      permissionForAction({
        type: "publish_announcement",
        level: "info",
        message: "x",
      }),
    ).toBe("announce");
    expect(permissionForAction({ type: "clear_announcement" })).toBe(
      "announce",
    );
    expect(
      permissionForAction({
        type: "set_schedule_status",
        id: "opening",
        status: "delayed",
        delayMinutes: 10,
      }),
    ).toBe("program");
    expect(
      permissionForAction({
        type: "set_spot_availability",
        id: "green-cafe",
        availability: "paused",
      }),
    ).toBe("spots");
    expect(
      permissionForAction({
        type: "set_congestion",
        id: "green-cafe",
        congestion: "high",
      }),
    ).toBe("spots");
    expect(permissionForAction({ type: "reset" })).toBe("reset");
  });

  it("内部アクション(replace)はAPI経由で許可しない", () => {
    expect(
      permissionForAction({
        type: "replace",
        state: {} as never,
      }),
    ).toBeNull();
  });
});
