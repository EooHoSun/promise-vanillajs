import AsyncClass from "./AsyncClass.js";

describe("AsyncClass 객체 생성 과정 테스트", () => {
  // 확인
  test("AsyncClass 객체 정상적인 생성 테스트", () => {
    // when
    const asyncClass = new AsyncClass(() => {});

    //then
    expect(asyncClass).toBeInstanceOf(AsyncClass);
  });

  // 확인
  test("AsyncClass 생성자 인풋값으로 function 이외의 값 부여시 에러 테스트", () => {
    //when then
    expect(() => new AsyncClass(1)).toThrowError(TypeError);
  });
});

describe("resolver 동작 테스트", () => {
  // given
  const initialInput = 1;
  //확인
  test("resolve로 넣어준 초기값이 then의 argument로 제대로 들어오는지 확인", () => {
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
  test("setTimeout시 동작 테스트", () => {
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

describe("reject에 Error 객체 부여시 행동 테스트", () => {
  // given
  const initialInput = new Error("error");
  // 확인
  test("부여한 error 객체 then에서 확인", () => {
    // when
    const asyncClass = new AsyncClass((resolve, reject) => {
      reject(initialInput);
    });

    // then
    asyncClass.then((result) => {
      expect(result).toEqual(initialInput);
    });
  });
});

describe("then 체이닝 테스트", () => {
  // given
  const initialInput = 1;
  // 확인
  test("time out 없는 환경에서 테스트", () => {
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
  test("time out 환경에서 테스트", () => {
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

describe("finally 테스트", () => {
  test("콜백함수 성공시 테스트", () => {
    let finally1 = false;
    let finally2 = false;
    new AsyncClass((resolve) => {
      setTimeout(() => {
        resolve(1);
      }, 1000);
    })
      .then(() => {
        finally1 = true;
        finally2 = true;
      })
      .finally(() => {
        expect(finally1).toEqual(true);
      })
      .finally(() => {
        expect(finally2).toEqual(true);
      });
  });
});

describe("Promise와 비교", () => {
  // 확인
  test("Promise.resolve 내부에서 성공하는 Promise 상황과 비교하는 테스트", () => {
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
  test("Promise.resolve 내부에서 실패하는 Promise 상황과 비교하는 테스트", () => {
    // when
    const promiseResolve = Promise.resolve(
      new Promise((resolve, reject) => {
        reject(1);
      }).catch((e) => e)
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
  test("Promise.reject 내부에서 실패하는 Promise 상황과 비교하는 테스트", () => {
    // when
    const promiseRejected = Promise.reject(
      new Promise((resolve, reject) => {
        reject(1);
      }).catch((e) => e)
    ).catch((e) => e);
    const asyncClassRejected = AsyncClass.reject(
      new AsyncClass((resolve, reject) => {
        reject(1);
      })
    ).catch((e) => e);

    // then
    asyncClassRejected.then((asyncClassError) => {
      promiseRejected.then((promiseError) => {
        expect(promiseError).toEqual(asyncClassError);
      });
    });
  });

  test("Promise.reject 내부에서 성공하는 Promise 상황과 비교하는 테스트", () => {
    // given
    const initialData = 1;
    // when
    const promiseRejected = Promise.reject(
      new Promise((resolve, reject) => {
        resolve(initialData);
      })
    ).catch((e) => e);
    const asyncClassRejected = AsyncClass.reject(
      new AsyncClass((resolve, reject) => {
        resolve(initialData);
      })
    );

    // then
    asyncClassRejected.then((asyncClassResult) => {
      expect(asyncClassResult).toEqual(initialData);
      promiseRejected.then((promiseResult) => {
        expect(asyncClassResult).toEqual(promiseResult);
      });
    });
  });

  test("Promise.all 함수와 비교하는 테스트( 랜덤으로 생성된 성공, 실패하는 promise 객체 10개의 결과를 AsyncClass.all과 비교 )", () => {
    // given => 실행시간이 겹치지 않도록 사전작업
    const tempTimes = Array(10)
      .fill(undefined)
      .reduce((prev, cur) => {
        let num;
        do {
          num = Math.ceil(Math.random() * 10);
        } while (prev.includes(num));
        return [...prev, num];
      }, []);

    // 동일한 환경의 promise, asyncClass 객체 10개 생성
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
        }).catch((error) => error),
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
        }).catch((error) => error),
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
    asyncAll.then((asyncAllResult) => {
      promiseAll.then((promiseAllResult) => {
        expect(asyncAllResult).toEqual(promiseAllResult);
      });
    });
  });

  test("then 함수 내부에서 throw가 발생했을 경우 테스트", () => {
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

  test("생성자에 전달해주는 함수 내부에서 throw가 발생할 경우에 대한 테스트", () => {
    // given
    const initialError = new Error("initialError");
    const initialData = 1;

    // when
    new Promise((resolve, reject) => {
      throw initialError;
      resolve(initialData);
    }).catch((promiseResult) => {
      new AsyncClass((resolve, reject) => {
        throw initialError;
        resolve(initialData);
      }).catch((asyncClassResult) => {
        expect(asyncClassResult).toEqual(promiseResult);
      });
    });
  });
});
