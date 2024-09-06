
// const intervalTime = new IntervalTime();

// // 更新时间
// intervalTime.interval(() => {
//     upDateTime()
// }, 1000)

// // 更新图表
// intervalTime.interval(() => {
//     echarts2Draw()
// }, 1000 * 5)

// // 更新所有序列
// intervalTime.update()

export class IntervalTime {
    private intervals: { callback: () => void, time: number, lastTime: number, remainingIterations: number }[] = [];

    constructor() {}

    interval(callback: () => void, time: number, iterations: number = Infinity) {
        this.intervals.push({ callback, time, lastTime: 0, remainingIterations: iterations });
    }

    update() {
        let now = performance.now(); // 使用 performance.now() 获取高精度时间

        for (let i = 0; i < this.intervals.length; i++) {
            const { callback, time, lastTime, remainingIterations } = this.intervals[i];
            let deltaTime = now - lastTime;

            if (deltaTime > time) {
                // 执行一秒内需要做的事情
                callback();
                // 更新剩余执行次数
                this.intervals[i].remainingIterations--;

                if (this.intervals[i].remainingIterations === 0) {
                    // 移除该interval
                    this.intervals.splice(i, 1);
                    i--; // 调整索引以正确处理移除元素后的下一个元素
                } else {
                    // 重置时间
                    this.intervals[i].lastTime = now;
                }
            }
        }
    }

    clearIntervals() {
        this.intervals = [];
    }
}

