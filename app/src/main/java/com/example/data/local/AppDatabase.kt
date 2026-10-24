package com.example.data.local

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import com.example.data.local.dao.GuardianDao
import com.example.data.local.dao.IncidentDao
import com.example.data.local.dao.UserProfileDao
import com.example.data.local.entity.GuardianEntity
import com.example.data.local.entity.IncidentEntity
import com.example.data.local.entity.UserProfileEntity

@Database(
    entities = [IncidentEntity::class, GuardianEntity::class, UserProfileEntity::class],
    version = 3,
    exportSchema = false
)
abstract class AppDatabase : RoomDatabase() {
    abstract fun incidentDao(): IncidentDao
    abstract fun guardianDao(): GuardianDao
    abstract fun userProfileDao(): UserProfileDao

    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null

        fun getInstance(context: Context): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "sankofa_safe_vault.db"
                )
                    .fallbackToDestructiveMigration(true)
                    .build()
                INSTANCE = instance
                instance
            }
        }
    }
}
