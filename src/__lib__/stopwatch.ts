const g_startTime = Date.now();
class Stopwatch {
  private startTime = Date.now();
  constructor(private duration: number) { }

  reset() {
    this.startTime = Date.now();
  }

  elapsed() {
    return Date.now() - this.startTime;
  }

  remaining() {
    return this.duration - this.elapsed();
  }
}
