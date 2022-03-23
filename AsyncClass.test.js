import AsyncClass from "./AsyncClass.js";

describe("create AsyncClass test", () => {
  // 확인
  test("created object instance check", () => {
    // when
    const asyncClass = new AsyncClass(() => {});

    //then
    expect(asyncClass).toBeInstanceOf(AsyncClass);
  });

  // 확인
  test("create parameter error", () => {
    //when then
    expect(() => new AsyncClass(1)).toThrowError(TypeError);
  });
});

describe("success test", () => {
  // given
  const initialInput = 1;
  //확인
  test("then test", () => {
    // when
    const asyncClass = new AsyncClass((resolve, reject) => {
      resolve(initialInput);
    });

    // then
    asyncClass.then((result) => {
      expect(result).toEqual(initialInput);
    });
  });

  // 확인
  test("setTimeout test", () => {
    // when
    const asyncClass = new AsyncClass((resolve, reject) => {
      setTimeout(() => {
        resolve(initialInput);
      }, 1000);
    });

    // then
    asyncClass.then((result) => {
      expect(result).toEqual(initialInput);
    });
  });
});

describe("error test", () => {
  // given
  const initialInput = new Error("error");
  // 확인
  test("then test", () => {
    // when
    const asyncClass = new AsyncClass((resolve, reject) => {
      reject(initialInput);
    });

    // then
    asyncClass.then((result) => {
      expect(result).toEqual(initialInput);
    });
  });

  // 확인
  test("setTimeout test", () => {
    // when
    const asyncClass = new AsyncClass((resolve, reject) => {
      setTimeout(() => {
        resolve(initialInput);
      }, 1000);
    });

    // then
    asyncClass.then((result) => {
      expect(result).toEqual(initialInput);
    });
  });
});

describe("then chaining test", () => {
  // given
  const initialInput = 1;
  // 확인
  test("then chaining without timeout", () => {
    // when
    const asyncClass = new AsyncClass((resolve, reject) => {
      resolve(initialInput);
    });

    // then
    asyncClass
      .then((result) => {
        expect(result).toEqual(initialInput);
        return result + 1;
      })
      .then((result) => {
        expect(result).toEqual(initialInput + 1);
      });
  });

  // 확인
  test("setTimeout test", () => {
    // when
    const asyncClass = new AsyncClass((resolve, reject) => {
      setTimeout(() => {
        resolve(initialInput);
      }, 2000);
    });

    // then
    asyncClass
      .then((result) => {
        expect(result).toEqual(initialInput);
        return result + 1;
      })
      .then((result) => {
        expect(result).toEqual(initialInput + 1);
      });
  });
});

describe("catch chaining test", () => {
  // given
  const initialInput = new Error("error");
  test("catch chaining without timeout", () => {
    // when
    const asyncClass = new AsyncClass((resolve, reject) => {
      reject(initialInput);
    });

    // then
    asyncClass
      .catch((result) => {
        expect(result).toEqual(initialInput);
        return result;
      })
      .catch((result) => {
        expect(result).toEqual(initialInput);
      })
      .catch((result) => {
        expect(result).toEqual(undefined);
      });
  });

  // 확인
  test("setTimeout test", () => {
    // when
    const asyncClass = new AsyncClass((resolve, reject) => {
      setTimeout(() => {
        reject(initialInput);
      }, 1000);
    });
    // then
    asyncClass.then((error) => {
      expect(error).toThrowError(initialInput);
    });
  });
});

describe("finally test", () => {
  test("finally without then", () => {});
});

describe("compare with Promise", () => {
  // 확인
  test("compare with resolve success function", () => {
    // when
    const promiseResolve = Promise.resolve(
      new Promise((resolve) => {
        resolve(1);
      })
    );
    const asyncClassResolve = AsyncClass.resolve(
      new AsyncClass((resolve) => {
        resolve(1);
      })
    );

    // then
    promiseResolve.then((e1) => {
      asyncClassResolve.then((e2) => {
        expect(e1).toEqual(e2);
      });
    });
  });

  // 확인
  test("compare with resolve failure function", () => {
    // when
    const promiseResolve = Promise.resolve(
      new Promise((resolve, reject) => {
        reject(1);
      })
    );
    const asyncClassResolve = AsyncClass.resolve(
      new AsyncClass((resolve, reject) => {
        reject(1);
      })
    );

    // then
    promiseResolve.catch((e1) => {
      asyncClassResolve.catch((e2) => {
        expect(e1).toEqual(e2);
      });
    });
  });

  // 확인
  test("compare with reject failure function", () => {
    // when
    const promiseRejected = Promise.reject(
      new Promise((resolve, reject) => {
        reject(1);
      })
    );
    const asyncClassRejected = AsyncClass.reject(
      new AsyncClass((resolve, reject) => {
        reject(1);
      })
    );

    // then
    promiseRejected.catch((promiseError) => {
      asyncClassRejected.catch((asyncClassError) => {
        expect(promiseError).toEqual(asyncClassError);
      });
    });
  });

  test("compare with reject success function", () => {
    // when
    const promiseRejected = Promise.reject(
      new Promise((resolve, reject) => {
        resolve(1);
      })
    );
    const asyncClassRejected = AsyncClass.reject(
      new AsyncClass((resolve, reject) => {
        resolve(1);
      })
    );

    // then
    promiseRejected.then((promiseError) => {
      asyncClassRejected.then((asyncClassError) => {
        expect(promiseError).toEqual(asyncClassError);
      });
    });
  });

  test("compare with promise.all function", () => {
    // given
    const tempTimes = Array(10)
      .fill(undefined)
      .reduce((prev, cur) => {
        let num;
        do {
          num = Math.ceil(Math.random() * 10);
        } while (prev.includes(num));
        return [...prev, num];
      }, []);

    const makeAsync = (idx) => {
      const num = tempTimes[idx];
      return [
        new AsyncClass((resolve, reject) => {
          try {
            setTimeout(() => {
              if (num % 2 === 0) {
                resolve(num);
              } else {
                reject(num);
              }
            }, num * 1000);
          } catch (error) {
            reject(num);
          }
        }).catch((error) => {}),
        new Promise((resolve, reject) => {
          try {
            setTimeout(() => {
              if (num % 2 === 0) {
                resolve(num);
              } else {
                reject(num);
              }
            }, num * 1000);
          } catch (error) {
            reject(num);
          }
        }).catch((error) => {}),
        num + "초",
        num % 2 === 0 ? "성공" : "실패",
      ];
    };

    // when
    const arr = Array(10)
      .fill(undefined)
      .map((e, idx) => makeAsync(idx));
    const asyncAll = AsyncClass.all(
      arr.map(([asyncClass, promise]) => asyncClass)
    );
    const promiseAll = Promise.all(arr.map(([asyncClass, promise]) => promise));

    // then
    asyncAll
      .then((asyncAllResult) => {
        promiseAll.then((promiseAllResult) => {
          expect(asyncAllResult).toEqual(promiseAllResult);
        });
      })
      .catch((asyncAllError) => {
        promiseAll.catch((promiseAllError) => {
          expect(asyncAllError).toEqual(promiseAllError);
        });
      });
  });

  test("throw error in then function", () => {
    // given
    const given = new AsyncClass((resolve, reject) => {
      resolve(1);
    });
    const givenError = new Error("error in then function");

    // when
    const when = given.then((result) => {
      throw givenError;
    });

    // then
    when.catch((error) => {
      expect(error).toEqual(givenError);
    });
  });

  test("throw Error in constructor parameter(=callbackFunction) ", () => {
    // given
    const initialError = new Error("initialError");
    const initialData = 1;

    // when
    const promiseErrorInConstructor = new Promise((resolve, reject) => {
      resolve(initialData);
      throw initialError;
    });
    const asyncClassErrorInConstructor = new AsyncClass((resolve, reject) => {
      resolve(initialData);
      throw initialError;
    });

    // then
    promiseErrorInConstructor
      .then((promiseResult) => {
        expect(1).toEqual(2);
        asyncClassErrorInConstructor.then((asyncClassResult) => {
          expect(asyncClassResult).toEqual(promiseResult).toEqual(initialInput);
        });
      })
      .catch((promiseError) => {
        asyncClassErrorInConstructor.catch((asyncClassError) => {
          expect(asyncClassError).toEqual(promiseError).toEqual(initialError);
        });
      });
  });
});
