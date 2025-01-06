class Clock {
  private startTime = DateTime.now();
  constructor(private maxDuration: Duration) { }

  reset() {
    this.startTime = DateTime.now();
  }

  elapsed() {
    return DateTime.now().diff(this.startTime).shiftToAll();
  }

  remaining() {
    return this.maxDuration.minus(this.elapsed()).shiftToAll();
  }
}
