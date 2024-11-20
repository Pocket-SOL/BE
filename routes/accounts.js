const express = require('express');
const router = express.Router();
const {Account, History} = require('../models');

//user의 계좌잔액 불러오기
router.get('/',(req,res,next)=>{
    const userId= req.query.id;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

  Account.findOne({ where: { user_id: userId } })
  .then(account => {
    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    History.sum('amount', { where: { account_id: account.account_id, transaction_type:'입금' } })
      .then(inputAmount => {
        const amount = inputAmount;
        History.sum('amount',{ where: { account_id: account.account_id, transaction_type:'출금' } })
        .then(outputAmount => {
            res.json({"totalAmount" : amount-outputAmount});
        })
      })
      .catch(err => {
        next(err);
      });
  })
  .catch(err => {
    next(err);
  });
});

//user의 계좌 이용 내역
router.get('/history',(req,res,next)=>{
    const userId=req.query.id;
    if (!userId){
        return res.status(400).json({message:"User Id is required"});
    }
    Account.findOne({where: { user_id: userId } }).then(account=>{
        if(!account){
            return res.status(404).json({message:"Account not found"});
        }
        History.findAll({where:{account_id:account.account_id}}).then(history=>{
            res.json(history);
        }).catch(err=>{
            next(err);
        });
    })
});


module.exports = router;