import discord
from discord.ext import commands
from prisma import Prisma


class Setup(commands.Cog):
    def __init__(self, bot):
        self.bot = bot
        self.db = Prisma()
        self.scheduleId = None
        self.announcementsId = None
        self.verificationId = None
        self.vericationRoleId = None

    @commands.command(hidden=True)
    @commands.has_permissions(administrator=True)
    async def setup_verification(self, ctx):
        """Creates user roles and verification channel"""
        verified_role = await ctx.guild.create_role(name="verified")
        verification_channel = await ctx.guild.create_text_channel(name="verification")
        await verification_channel.set_permissions(verification_channel.guild.default_role, view_channel=True)
        await verification_channel.set_permissions(verified_role, read_messages=False)
        self.verificationId = verification_channel.id
        self.verificationId = verified_role.id

        # Hide all other channels from users without the verified role
        for channel in ctx.guild.channels:
            if channel.id == verification_channel.id:
                continue  # Skip the verification channel
            await channel.set_permissions(
                verified_role, read_messages=True, send_messages=True
            )
            await channel.set_permissions(
                ctx.guild.default_role, read_messages=False, send_messages=False
            )

        # Send verification message in the verification channel
        await verification_channel.send(
            f"Please type **{ ctx.prefix }verify** to verify"
        )

    @commands.command(hidden=True)
    @commands.has_permissions(administrator=True)
    async def setup_announcements(self, ctx):
        """Creates announcement channel"""
        overwrites = {
            ctx.guild.default_role: discord.PermissionOverwrite(send_messages=False),
            ctx.guild.me: discord.PermissionOverwrite(send_messages=True),
        }

        announcements_channel = await ctx.guild.create_text_channel(
            "announcements", overwrites=overwrites
        )
        self.announcementsId = announcements_channel.id
        await ctx.send(f"Channel {announcements_channel.mention} created.")

    @commands.command(hidden=True)
    @commands.has_permissions(administrator=True)
    async def setup_schedule(self, ctx):
        """Creates schedule channel"""
        overwrites = {
            ctx.guild.default_role: discord.PermissionOverwrite(send_messages=False),
            ctx.guild.me: discord.PermissionOverwrite(send_messages=True),
        }
        schedule_channel = await ctx.guild.create_text_channel(
            "schedule", overwrites=overwrites
        )
        self.scheduleId = schedule_channel.id
        await ctx.send(f"Channel {schedule_channel.mention} created.")

    @commands.command()
    @commands.has_permissions(administrator=True)
    async def setup(self, ctx):
        """Fully sets up the user roles, as well as the announcement, schedule, and verification channels."""
        await self.db.connect()
        await self.setup_announcements(ctx)
        await self.setup_schedule(ctx)
        await self.setup_verification(ctx)
        await self.db.discord.create(
            data={
                "verificationRole": self.verificationId,
                "verificationId": self.verificationId,
                "scheduleId": self.scheduleId,
                "announcementId": self.announcementsId,
            },
        )
        await self.db.disconnect()


async def setup(bot):
    await bot.add_cog(Setup(bot))
