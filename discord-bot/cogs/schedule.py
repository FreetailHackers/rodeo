from datetime import datetime, timedelta
import pytz
import discord
from discord.ext import commands, tasks
from prisma import Prisma

class EventCog(commands.Cog):
    def __init__(self, bot):
        self.bot = bot
        self.check_event_time.start()
        self.db = Prisma()
        self.timezone = pytz.timezone("US/Central")  # specify the Central Time Zone

    def cog_unload(self):
        self.check_event_time.cancel()

    @tasks.loop(minutes=1.0)
    async def check_event_time(self):
        await self.db.connect()
        events = (
            await self.db.event.find_many()
        )  # retrieve all events from your database
        for event in events:
            now = datetime.now(
                self.timezone
            )  # get the current time in Central Time Zone
            time_diff = (
                event.start - now
            )  # calculate the time difference between now and the event start time
            if time_diff <= timedelta(minutes=5) and time_diff >= timedelta(
                minutes=4
            ):  # if the event is 5 minutes away from starting
                embed = discord.Embed(
                    title=event.name,
                    description=event.description,
                    color=discord.Color.blue(),
                )
                embed.add_field(name="Location", value=event.location)
                embed.add_field(
                    name="Start", value=event.start.strftime("%m/%d/%Y, %I:%M %p CT")
                )
                embed.add_field(
                    name="End", value=event.end.strftime("%m/%d/%Y, %I:%M %p CT")
                )
                embed.add_field(name="Type", value=event.type)
                discord_model = await self.db.discord.find_first(order={"id": "desc"})
                if discord_model != None:
                    schedule_channel = self.bot.get_channel(discord_model.scheduleId)
                    message = f"Starting in 5 minutes!"
                    await schedule_channel.send(embed=embed, content=message)
        await self.db.disconnect()

async def setup(bot):
    await bot.add_cog(EventCog(bot))
