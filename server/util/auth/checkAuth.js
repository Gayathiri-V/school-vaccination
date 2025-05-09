function checkAuth(req, res, next){
    console.log("here1");
    const { authorization } = req.headers;
    console.log("here2");
    if (!authorization) {
      res.status(401).json({ message: 'No authorization header sent' })
      console.log("here3");
      next({
          error: true,
          decoded: null
        })
    }
    const token = authorization.split(' ')[1];
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        res.status(401).json({ message: 'Unable to verify token' });
        console.log("here4");
        next({
          error: true,
          decoded: null
        })
      }
      console.log("here5");
      next({
        error: false,
        decoded: decoded
      })
    });
  }
  