import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import React from 'react'


const AdminSearchbar = () => {
    return (
        <div className='min-w-[60%] relative flex items-center border rounded-full'>
            <Button type='submit' size="sm" variant="ghost" className='absolute left-0 h-full rounded-l-none bg-transparent hover:bg-transparent'>
                <Search className='size-4' />
                <span className='sr-only'>Tìm kiếm</span>
            </Button>
            <Input type='text' placeholder='Tìm kiếm' className='flex-grow bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 ml-6' />
        </div>
    )
}

export default AdminSearchbar