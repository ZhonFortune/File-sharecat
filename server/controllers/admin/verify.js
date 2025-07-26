const jwt = require('jsonwebtoken');

const secret = process.env.SECRET_KEY;
const admin_username = process.env.ADMIN_USERNAME;
const admin_password = process.env.ADMIN_PASSWORD;

function jwtsign(Object) {

    const token = jwt.sign(
        Object, 
        secret, 
    { 
        expiresIn: '1d'
    })

    return token;
}

function setCookieHandle() {
    const secureStatus = process.env.ENV === 'production' ? true : false;
    const sameSiteStatus = process.env.ENV === 'production' ? 'none' : 'lax';
    const Object = {
        maxAge: 86400000 , httpOnly: true
        // 检查DEV环境
        , secure: secureStatus
        , sameSite: sameSiteStatus
        , path: '/'
    }
    return Object;
}

// 登录
function login(req, res, next) {
    const { username, password } = req.body;
    const reqUsername = username.trim();
    const reqPassword = password.trim();

    if (reqUsername === admin_username && reqPassword === admin_password) {
        // 返回cookie，设置token
        const token = jwtsign({ username: reqUsername });
        console.log(`[后台] - 登录成功: ${token}`)
        res.cookie('logintoken', token, setCookieHandle());
        res.status(200).json({
            code: 200,
            msg: '登录成功'
        })
    } else {
        res.status(200).json({
            code: 401,
            msg: '账号或密码错误'
        })
    }
}

// 校验登录状态
function isLoggedIn(req, res, next) {
    const token = req.cookies?.logintoken;
    console.log(`[后台] - 校验登陆状态: ${ token ? token : '无Cookie信息'}`)

    if( !token || token === undefined || token === null) {  
        return res.status(200).json({
            code: 401,
            msg: '请先登录',
            result: false
        })
    }

    jwt.verify(token, secret, (err, decoded) => {
        if (err) {
            console.log(`[后台] - 登录状态已过期`)
            return res.status(200).json({
                code: 401,
                msg: '登录状态已过期或无效, 请重新登录',
                result: false
            })
        } else {
            // 检查是否临近过期时间(30Min)
            const now = Math.floor(Date.now() / 1000);
            const exp = decoded.exp;

            if (exp - now < 1800) {
                console.log(`[后台] - 登录状态临近过期，更新token`)

                // 若临近过期时间，则更新token
                const newToken = jwtsign({ username: decoded.username });
                
                res.cookie('logintoken', newToken, setCookieHandle());

                return res.status(200).json({
                    code: 200,
                    msg: '登录状态已更新',
                    result: true
                })

            } else {
                console.log(`[后台] - 登录状态正常`)

                return res.status(200).json({
                    code: 200,
                    msg: '登录状态正常',
                    result: true
                })
            }
        }
    })
}

module.exports = {
    login,
    isLoggedIn,
}