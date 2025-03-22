import { scrollToTop } from '@/utils'
import { useEffect } from 'react'

const scrollPositions: Record<string, number | undefined> = {}

const useScrollPosition = (page: string) => {
    useEffect(() => {
        // Khôi phục vị trí cuộn cho trang hiện tại, hoặc về đầu trang nếu không có dữ liệu
        scrollToTop(scrollPositions[page] || 0, 'auto')
        const save = () => {
            // Lưu object với key là tên page và value là position theo trục y hiện tại
            scrollPositions[page] = document.body.scrollTop
            console.log(`Saved ${page}: ${scrollPositions[page]}`)
        }

        document.body.addEventListener('scroll', save)
        return () => {
            document.body.removeEventListener('scroll', save)
        }
    }, [page])
}

export default useScrollPosition;