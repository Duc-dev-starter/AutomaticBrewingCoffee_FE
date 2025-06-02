import React from 'react'

const CustomFallback = () => {
    return (
        <div>
            <h2>Đã xảy ra lỗi nghiêm trọng 😢</h2>
            <button onClick={() => window.location.reload()}>Tải lại trang</button>
        </div>
    )
}

export default CustomFallback