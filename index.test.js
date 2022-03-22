import AsyncClass from "./index";

describe("create AsyncClass test", () => {
  // 확인
  test("created object instance check", () => {
    const asyncClass = new AsyncClass(() => {});
    expect(asyncClass).toBeInstanceOf(AsyncClass);
  });

  // 확인
  test("create parameter error", () => {
    expect(() => new AsyncClass(1)).toThrowError(TypeError);
  });
});

describe("success test", () => {
  const initialInput = 1;
  //확인
  test("then test", () => {
    const asyncClass = new AsyncClass((resolve, reject) => {
      resolve(initialInput);
    });

    asyncClass.then((result) => {
      expect(result).toEqual(initialInput);
    });
  });

  test("setTimeout test", () => {
    const asyncClass = new AsyncClass((resolve, reject) => {
      setTimeout(() => {
        resolve(initialInput);
      }, 1000);
    });

    // 확인
    asyncClass.then((result) => {
      expect(result).toEqual(initialInput);
    });
  });
});

describe("error test", () => {
  const initialInput = new Error("error");
  // 확인
  test("then test", () => {
    const asyncClass = new AsyncClass((resolve, reject) => {
      reject(initialInput);
    });

    asyncClass.then((result) => {
      expect(result).toEqual(initialInput);
    });
  });

  // 확인
  test("setTimeout test", () => {
    const asyncClass = new AsyncClass((resolve, reject) => {
      setTimeout(() => {
        resolve(initialInput);
      }, 1000);
    });

    asyncClass.then((result) => {
      expect(result).toEqual(initialInput);
    });
  });
});

describe("then chaining test", () => {
  const initialInput = 1;
  // 확인
  test("then chaining without timeout", () => {
    const asyncClass = new AsyncClass((resolve, reject) => {
      resolve(initialInput);
    });

    asyncClass
      .then((result) => {
        expect(result).toEqual(initialInput);
        return result + 1;
      })
      .then((result) => {
        expect(result).toEqual(initialInput + 1);
      });
  });

  test("setTimeout test", () => {
    const asyncClass = new AsyncClass((resolve, reject) => {
      setTimeout(() => {
        resolve(initialInput);
      }, 2000);
    });

    // 확인
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
  const initialInput = new Error("error");
  test("catch chaining without timeout", () => {
    const asyncClass = new AsyncClass((resolve, reject) => {
      reject(initialInput);
    });

    asyncClass.catch((result) => {
      expect(result).toEqual(initialInput);
    });
  });

  test("setTimeout test", () => {
    const asyncClass = new AsyncClass((resolve, reject) => {
      setTimeout(() => {
        resolve(initialInput);
      }, 1000);
    });

    asyncClass
      .catch((error) => {
        expect(error).toThrowError(initialInput);
        return new Error("1");
      })
      .catch((error) => {
        expect(error).toEqual(initialInput);
        expect(error).toBeInstanceOf(Error);
      });
  });
});

describe("finally test", () => {
  test("finally without then", () => {});
});

describe("compare with Promise", () => {
  // 확인
  test("compare with resolve success function", () => {
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
    promiseResolve.then((e1) => {
      asyncClassResolve.then((e2) => {
        expect(e1).toEqual(e2);
      });
    });
  });

  // 확인
  test("compare with resolve failure function", () => {
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
    promiseResolve.catch((e1) => {
      asyncClassResolve.catch((e2) => {
        expect(e1).toEqual(e2);
      });
    });
  });

  // 확인
  test("compare with reject failure function", () => {
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

    promiseRejected.catch((promiseError) => {
      asyncClassRejected.catch((asyncClassError) => {
        expect(promiseError).toEqual(asyncClassError);
      });
    });
  });

  test("compare with reject success function", () => {
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

    promiseRejected.then((promiseError) => {
      asyncClassRejected.then((asyncClassError) => {
        expect(promiseError).toEqual(asyncClassError);
      });
    });
  });
});
