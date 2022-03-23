export default class AsyncClass {
  timestamp = new Date().getMilliseconds();
  static resolve(result) {
    if (result instanceof AsyncClass) {
      return new AsyncClass((resolve, reject) => {
        result
          .then((e) => {
            resolve(e);
          })
          .catch((e) => {
            reject(e);
          });
      });
    } else {
      return new AsyncClass((resolve) => {
        resolve(result);
      });
    }
  }

  static reject(result) {
    if (result instanceof AsyncClass) {
      return new AsyncClass((resolve, reject) => {
        result
          .then((e) => {
            resolve(e);
          })
          .catch((e) => {
            reject(e);
          });
      });
    } else {
      return new AsyncClass((resolve, reject) => {
        reject(result);
      });
    }
  }

  static all(asyncClasses) {
    let count = asyncClasses.length;
    const lastResult = Array(asyncClasses.length).fill(undefined);
    let firstError = undefined;
    return new AsyncClass((resolve, reject) => {
      asyncClasses.forEach((asyncClass, idx) => {
        asyncClass.then((result) => {
          count--;
          lastResult[idx] = result;
          if (count === 0) {
            if (firstError) {
              reject(firstError);
            } else {
              resolve(lastResult);
            }
          }
        });
        asyncClass.catch((error) => {
          if (!firstError) {
            firstError = error;
          }
          count--;
          if (count === 0) {
            if (firstError) {
              reject(firstError);
            } else {
              resolve(lastResult);
            }
          }
        });
      });
    });
  }

  #state = "pending";
  #result = undefined;

  #onThen = [];
  #onCatch = [];
  #onFinally;

  #resolve = (result) => {
    if (this.#state !== "rejected") {
      this.#result = result;
      this.#state = "fulfilled";

      if (result instanceof AsyncClass) {
        result.#onThen.push(this.#resolve);
      } else {
        if (this.#onThen.length !== 0) {
          this.#onThen.reduce((prev, cur) => {
            let res = prev;
            try {
              res = cur(prev);
            } catch (error) {
              this.#onCatch.reduce((prev, cur) => {
                return cur(prev);
              }, error);
            }
            return res;
          }, this.#result);
          this.#onThen = [];
        }
        this.#onFinally && this.#onFinally(this.#reject);
        this.#onFinally = undefined;
      }
    }
  };

  #reject = (error) => {
    if (this.#state !== "fulfilled") {
      this.#result = error;
      this.#state = "rejected";

      if (error instanceof AsyncClass) {
        error.#onCatch.push(this.#reject);
      } else {
        if (this.#onCatch.length !== 0) {
          this.#onCatch.reduce((prev, cur) => {
            return cur(this.#result);
          }, this.#result);
        }
        this.#onFinally && this.#onFinally(this.#reject);
        this.#onFinally = undefined;
      }
    }
  };

  constructor(callback) {
    try {
      callback(this.#resolve, this.#reject);
    } catch (error) {
      if (error instanceof TypeError) {
        throw error;
      } else {
        this.#reject(error);
      }
    }
  }

  then(onResolve) {
    if (this.#state === "pending") {
      this.#onThen.push(onResolve);
      return this;
    } else if (this.#state === "fulfilled") {
      return new AsyncClass((resolve, reject) => {
        try {
          resolve(onResolve(this.#result));
        } catch (error) {
          resolve(error);
        }
      });
    } else if (this.#state === "rejected") {
      return this;
    }
  }
  catch(onReject) {
    if (this.#state === "pending") {
      this.#onCatch.push(onReject);
      return this;
    } else if (this.#state === "fulfilled") {
      return this;
    } else if (this.#state === "rejected") {
      return new AsyncClass((resolve, reject) => {
        reject(onReject(this.#result));
      });
    }
    return this;
  }

  finally(onFinally) {
    if (this.#state === "pending") {
      this.#onFinally = onFinally;
    } else {
      onFinally(this.#result);
    }
  }
}
