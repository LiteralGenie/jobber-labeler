import ExperienceLabeler from "@/components/experience-labeler/experience-labeler"
import Sidebar from "@/components/sidebar/sidebar"
import styles from "./main.module.scss"

export default function MainComponent() {
    return (
        <div className={styles.container}>
            <Sidebar></Sidebar>
            <main>
                <ExperienceLabeler></ExperienceLabeler>
            </main>
        </div>
    )
}
