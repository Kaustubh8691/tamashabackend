const express = require("express");
const router = new express();
const Data = require("../models/Food")
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const userAuth = async (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.json({
      status: "Not logged-in",
      message: "User isn't logged in.!",
    });
  }
  jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(400).json({
        status: "Error",
        message: "Invaild user",
      });
    }
    req.user = user;
    next();
  });
};
// getting all food entries of user
router.get("/user/all", userAuth, async (req, res) => {
  let data = await Data.find({ User: req.user._id });

  res.json({
    status: "sucess",
    data: await data,
  });
});

// getting food entries of perticular date
router.get("/users/daywise/:date", userAuth, async (req, res) => {

  const date = req.params.date;
  let data = await Data.find({ date: date, User: req.user._id });

  res.json({
    status: "sucess",
    data: data,
  });
});

router.get("/users/id/:id", userAuth, async (req, res) => {

  const id = req.params.id;
  let data = await Data.find({ _id: id, User: req.user._id });

  res.json({
    status: "sucess",
    data: data,
  });
});

// adding food entries
router.post("/calories", userAuth, async (req, res) => {
  try {
    const date1 = new Date();
    let day = date1.getDate();

    let month = date1.getMonth() + 1;
    let year = date1.getFullYear();
    let date2 = "";
    date2 += year + "-" + month + "-" + day;
    // date2="2022-7-25";
    // console.log(date2);
    let hours = date1.getHours();
    let minute = date1.getMinutes();
    let Time = hours + ":" + minute;

    let totalCaloris = 0;
    let datas = Object.values(req.body);
    datas.map(calories => {
      if (!isNaN(calories)) {
        totalCaloris += calories;
      }
    })

    // console.log(totalCaloris);
    const user = await User.findOne({ _id: req.user._id });
    limit = user.limit;
    const daycalories = await Data.find({ date: date2, User: req.user._id });

    let cal = 0;
    if (daycalories.length > 0) {
      let index = daycalories.length;
      cal += daycalories[index - 1].PreviousCalories;
    }

    let PreviousCalories = totalCaloris + cal;

    if (PreviousCalories < limit) {
      const data = new Data({
        ...req.body,
        date: date2,
        Time: Time,
        totalCaloris: totalCaloris,
        PreviousCalories: PreviousCalories,
        User: req.user._id
      });

      res.json({
        status: "sucess",
        data: await data.save(),
        message: "data added sucessfully",
      })
    } else {
      // this condition as threshold limit
      const data = new Data({
        ...req.body,
        date: date2,
        Time: Time,
        totalCaloris: totalCaloris,
        PreviousCalories: PreviousCalories,
        User: req.user._id
      });
      res.json({
        status: "warning",
        message: "Your cross daily limit !",
        data: await data.save(),

      });

    }
  } catch (error) {
    res.json({
      Error: error
    })
  }

});

// show all users to only who are Admin
router.get("/Admin/allusers", userAuth, async (req, res) => {
  try {
    const user1 = await User.findOne({ _id: req.user._id });
    const role = user1.Role;
    if (role == "User") {
      const data = await User.find();
      res.json({
        status: "success",
        message: "all users data",
        data: data
      })
    } else {
      res.json({
        status: "warning",
        message: "this page only for Admin"
      })
    }

  } catch (error) {
    res.json({
      status: "error",
      message: error
    })
  }
})

// food  entries of perticular user
router.get("/Admin/userentry/:id", userAuth, async (req, res) => {
  try {

    const user1 = await User.findOne({ _id: req.user._id });
    const role = user1.Role;
    if (role == "User") {
      const user = req.params.id;
      const data = await Data.find({ User: user });
      if (!data) {
        return res.json({
          status: "Not found",
          message: "post not found",
        });
      }
      res.json({
        status: "sucess",
        data: await data,
      });
    } else {
      res.status(400).json({
        status: "not Authorized",
        message: "only admin can see this data"
      });
    }

  } catch (e) {
    res.json({
      status: "err",
      message: e.message,
    });
  }
});

// report for perticular user 
router.get("/Admin/report/userentry/:id", userAuth, async (req, res) => {
  try {
    const user1 = await User.findOne({ _id: req.user._id });
    const role = user1.Role;
    if (role == "Admin") {
      const user = req.params.id;
      const data = await Data.find({ User: user }).sort({ date: 1 });

      if (!data) {
        return res.json({
          status: "Not found",
          message: "post not found",
        });
      }
      let lastindex = data.length;
      let currentDate = data[lastindex - 1].date;
      let day1 = currentDate.split("-")[0];
      day1 = day1;

      let array = [];

      for (let i = 0; i < 2; i++) {
        let day2 = parseInt(day1) - 7;


        let dass = await Data.find({ date: { $gte: ("2022-7-" + day2), $lte: ("2022-7-" + day1) } })
        array.push(dass.length);
        if (i == 0) {
          let ans = 0
          let summ = dass.map(items => {
            ans += items.totalCaloris;
          });
          array.push(ans);
        }
        day1 = day2;
      }

      let currentEntries = array[0];
      let lastWeekEntries = array[2];
      let avarage = parseInt(array[1] / 7);
      const Result = {
        current7Entries: currentEntries,
        lastWeekEntries: lastWeekEntries,
        AvarageCalories: avarage
      }
      res.json({
        status: "sucess",
        report: Result
      });
    } else {
      res.status(400).json({
        status: "not Authorized",
        message: "only admin can see this data"
      });
    }

  } catch (e) {
    res.json({
      status: "err",
      message: e.message,
    });
  }
});

// updating limit of calories
router.put("/user/:id", userAuth, async (req, res) => {

  try {
    const id = req.params.id;
    const userId = req.user._id;
    const user = await User.findOne({ _id: req.user._id });
    const role = user.Role;
    if (id == userId) {
      const limit = req.body.limit;

      const data = await User.findOneAndUpdate(
        { _id: req.user._id },
        { $set: { limit: limit } }
      );

      res.json({
        status: "sucess",
        message: "something updated by user",
      });
    } else if (role == "Admin") {
      const limit = req.body.limit;

      const data = await User.findOneAndUpdate(
        { _id: req.user._id },
        { $set: { limit: limit } }
      );

      res.json({
        status: "sucess",
        message: "something updated by Admin",
      });
    } else {
      res.status(400).json({
        status: "Authorisation error",
        message: "you con not update another user data",
      });
    }

  } catch (e) {
    res.json({
      status: "err",
      message: e.message,
    });
  }
});

// deleting food entry
router.delete("/user/:id", userAuth, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user._id });
    const role = user.Role;
    const id = req.params.id;
    if (role == "User") {
      const data = await Data.findOneAndDelete(
        { _id: id }
      );
      res.json({
        status: "success",
        message: "food entry deleted sucessfully"
      });
    } else {
      res.json({
        status: "Error",
        message: "your are not Admin"
      });
    }

  } catch (error) {
    res.json({
      error: error
    });
  }
})

module.exports = router;
