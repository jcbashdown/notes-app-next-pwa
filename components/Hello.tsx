import { useAppSelector } from '@/lib/redux/hooks'
import { selectStatus } from '@/lib/redux/features/noteSlice'
import styles from '@/styles/Home.module.css'

export default function Home() {
    const status = useAppSelector(selectStatus)

    return (
        <h1 className={styles.title}>
            Welcome to <a href="https://nextjs.org">{status}</a>
        </h1>
    )
}
